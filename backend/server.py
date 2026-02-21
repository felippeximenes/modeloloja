from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

from bson import ObjectId

# ---------------------------
# Env loading
# ---------------------------
ROOT_DIR = Path(__file__).parent

env_file = ROOT_DIR / ".env"
if env_file.exists():
    load_dotenv(env_file)
else:
    load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "moldz3d")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

# ---------------------------
# Melhor Envio (OAuth)
# ---------------------------
MELHOR_ENVIO_SANDBOX = os.getenv("MELHOR_ENVIO_SANDBOX", "true").lower() in ("1", "true", "yes", "y")
MELHOR_ENVIO_CLIENT_ID = os.getenv("MELHOR_ENVIO_CLIENT_ID")
MELHOR_ENVIO_CLIENT_SECRET = os.getenv("MELHOR_ENVIO_CLIENT_SECRET")
MELHOR_ENVIO_PUBLIC_URL = (os.getenv("MELHOR_ENVIO_PUBLIC_URL") or "").rstrip("/")
MELHOR_ENVIO_FROM_CEP = os.getenv("MELHOR_ENVIO_FROM_CEP", "")
MELHOR_ENVIO_USER_AGENT = os.getenv("MELHOR_ENVIO_USER_AGENT", "Moldz3D (contato@exemplo.com)")
MELHOR_ENVIO_OAUTH_SCOPE = (os.getenv("MELHOR_ENVIO_OAUTH_SCOPE") or "").strip()

# ✅ dados do remetente (LOJA) - necessários para /me/cart
ME_FROM_NAME = os.getenv("MELHOR_ENVIO_FROM_NAME", "")
ME_FROM_PHONE = os.getenv("MELHOR_ENVIO_FROM_PHONE", "")
ME_FROM_EMAIL = os.getenv("MELHOR_ENVIO_FROM_EMAIL", "")
ME_FROM_ADDRESS = os.getenv("MELHOR_ENVIO_FROM_ADDRESS", "")
ME_FROM_NUMBER = os.getenv("MELHOR_ENVIO_FROM_NUMBER", "")
ME_FROM_COMPLEMENT = os.getenv("MELHOR_ENVIO_FROM_COMPLEMENT", "")
ME_FROM_DISTRICT = os.getenv("MELHOR_ENVIO_FROM_DISTRICT", "")
ME_FROM_CITY = os.getenv("MELHOR_ENVIO_FROM_CITY", "")
ME_FROM_STATE = os.getenv("MELHOR_ENVIO_FROM_STATE", "")

ME_BASE = "https://sandbox.melhorenvio.com.br" if MELHOR_ENVIO_SANDBOX else "https://melhorenvio.com.br"
ME_AUTHORIZE_URL = f"{ME_BASE}/oauth/authorize"
ME_TOKEN_URL = f"{ME_BASE}/oauth/token"
ME_CALLBACK_PATH = "/api/melhorenvio/callback"

# ---------------------------
# App
# ---------------------------
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ---------------------------
# Logging
# ---------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("backend")

# ---------------------------
# Mongo client (lazy init)
# ---------------------------
client: Optional[AsyncIOMotorClient] = None
db = None

def ensure_db():
    global client, db

    if not MONGO_URL:
        raise HTTPException(
            status_code=500,
            detail="MONGO_URL is not set. Create backend/.env (see .env.example) or set it in your environment.",
        )

    if client is None:
        logger.info("Initializing Mongo client...")
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]

    return db

# ---------------------------
# Helpers
# ---------------------------
def sanitize_cep(value: str) -> str:
    return "".join([c for c in str(value or "") if c.isdigit()])[:8]

def normalize_token_type(token_type: str | None) -> str:
    tt = (token_type or "").strip()
    if not tt:
        return "Bearer"
    tt = tt.replace("/", "").strip()
    if tt.lower() == "bearer":
        return "Bearer"
    return tt

def require_env(label: str, value: str):
    if not str(value or "").strip():
        raise HTTPException(status_code=500, detail=f"Missing {label} in backend/.env")

def require_me_config():
    if not MELHOR_ENVIO_CLIENT_ID or not MELHOR_ENVIO_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Melhor Envio not configured. Set MELHOR_ENVIO_CLIENT_ID and MELHOR_ENVIO_CLIENT_SECRET in backend/.env",
        )
    if not MELHOR_ENVIO_PUBLIC_URL:
        raise HTTPException(
            status_code=500,
            detail="Missing MELHOR_ENVIO_PUBLIC_URL in backend/.env (use your ngrok https URL).",
        )

    from_cep = sanitize_cep(MELHOR_ENVIO_FROM_CEP)
    if len(from_cep) != 8:
        raise HTTPException(
            status_code=500,
            detail="Missing/invalid MELHOR_ENVIO_FROM_CEP in backend/.env (needs 8 digits).",
        )

    if not MELHOR_ENVIO_USER_AGENT.strip():
        raise HTTPException(
            status_code=500,
            detail="Missing MELHOR_ENVIO_USER_AGENT in backend/.env",
        )

def require_sender_config_for_cart():
    require_env("MELHOR_ENVIO_FROM_NAME", ME_FROM_NAME)
    require_env("MELHOR_ENVIO_FROM_PHONE", ME_FROM_PHONE)
    require_env("MELHOR_ENVIO_FROM_ADDRESS", ME_FROM_ADDRESS)
    require_env("MELHOR_ENVIO_FROM_NUMBER", ME_FROM_NUMBER)
    require_env("MELHOR_ENVIO_FROM_DISTRICT", ME_FROM_DISTRICT)
    require_env("MELHOR_ENVIO_FROM_CITY", ME_FROM_CITY)
    require_env("MELHOR_ENVIO_FROM_STATE", ME_FROM_STATE)

def get_redirect_uri() -> str:
    return f"{MELHOR_ENVIO_PUBLIC_URL}{ME_CALLBACK_PATH}"

async def save_oauth_state(state: str):
    database = ensure_db()
    await database.oauth_states.insert_one(
        {"state": state, "created_at": datetime.now(timezone.utc).isoformat()}
    )

async def pop_oauth_state(state: str) -> bool:
    database = ensure_db()
    doc = await database.oauth_states.find_one_and_delete({"state": state})
    return bool(doc)

async def save_token(token_payload: dict):
    database = ensure_db()

    now = datetime.now(timezone.utc)
    expires_in = token_payload.get("expires_in")
    expires_at = None
    if isinstance(expires_in, int):
        expires_at = (now.timestamp() + expires_in)

    doc = {
        "access_token": token_payload.get("access_token"),
        "refresh_token": token_payload.get("refresh_token"),
        "token_type": normalize_token_type(token_payload.get("token_type")),
        "scope": token_payload.get("scope"),
        "expires_in": expires_in,
        "expires_at": expires_at,
        "updated_at": now.isoformat(),
        "sandbox": MELHOR_ENVIO_SANDBOX,
    }

    await database.melhorenvio_tokens.update_one(
        {"_id": "current"},
        {"$set": doc},
        upsert=True,
    )

async def get_current_token_doc() -> dict:
    database = ensure_db()
    doc = await database.melhorenvio_tokens.find_one({"_id": "current"}, {"_id": 0})
    if not doc or not doc.get("access_token"):
        raise HTTPException(status_code=401, detail="Melhor Envio não conectado (token não encontrado).")
    return doc

def build_auth_header(token_doc: dict) -> str:
    token_type = normalize_token_type(token_doc.get("token_type"))
    access_token = str(token_doc["access_token"]).strip()
    return f"{token_type} {access_token}"

def build_sender_from_env() -> dict:
    from_cep = sanitize_cep(MELHOR_ENVIO_FROM_CEP)
    return {
        "name": ME_FROM_NAME,
        "phone": ME_FROM_PHONE,
        "email": (ME_FROM_EMAIL or None),
        "address": ME_FROM_ADDRESS,
        "number": ME_FROM_NUMBER,
        "complement": (ME_FROM_COMPLEMENT or None),
        "district": ME_FROM_DISTRICT,
        "city": ME_FROM_CITY,
        "state_abbr": ME_FROM_STATE,
        "postal_code": from_cep,
    }

def sanitize_document(value: str) -> str:
    return "".join([c for c in str(value or "") if c.isdigit()])

# ---------------------------
# Models
# ---------------------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ProductCreate(BaseModel):
    name: str
    price: float
    weight_kg: float
    width_cm: float
    height_cm: float
    length_cm: float
    sku: str | None = None
    image: str | None = None

class ProductOut(ProductCreate):
    id: str

class QuoteRequest(BaseModel):
    to_cep: str
    product_id: str
    quantity: int = 1
    insurance_value: float | None = None

class QuoteResponse(BaseModel):
    raw: Any

class CreateShipmentRequest(BaseModel):
    to_cep: str
    product_id: str
    quantity: int = 1
    service_id: int

    receiver_name: str
    receiver_phone: str
    receiver_document: str  # CPF/CNPJ

    receiver_email: str | None = None
    receiver_address: str
    receiver_number: str
    receiver_complement: str | None = None
    receiver_district: str
    receiver_city: str
    receiver_state: str

    insurance_value: float | None = None

class CreateShipmentResponse(BaseModel):
    raw: Any

class CartResponse(BaseModel):
    raw: Any

# ✅ NOVO: Checkout
class CheckoutRequest(BaseModel):
    # ids dos itens do carrinho. Se vazio, faz checkout de tudo no carrinho.
    orders: list[str] = []

class CheckoutResponse(BaseModel):
    raw: Any

# ---------------------------
# Routes
# ---------------------------
@api_router.get("/")
async def root():
    return {
        "message": "Hello World",
        "db_configured": bool(MONGO_URL),
        "db_name": DB_NAME,
        "melhor_envio_sandbox": MELHOR_ENVIO_SANDBOX,
    }

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    database = ensure_db()
    status_obj = StatusCheck(client_name=input.client_name)

    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()

    await database.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    database = ensure_db()
    status_checks = await database.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check.get("timestamp"), str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])
    return status_checks

# ---------------------------
# Melhor Envio OAuth endpoints
# ---------------------------
@api_router.get("/melhorenvio/auth")
async def melhorenvio_auth():
    require_me_config()

    state = str(uuid.uuid4())
    await save_oauth_state(state)

    params = {
        "client_id": MELHOR_ENVIO_CLIENT_ID,
        "redirect_uri": get_redirect_uri(),
        "response_type": "code",
        "state": state,
    }

    if MELHOR_ENVIO_OAUTH_SCOPE:
        params["scope"] = MELHOR_ENVIO_OAUTH_SCOPE

    url = f"{ME_AUTHORIZE_URL}?{urlencode(params)}"
    return RedirectResponse(url=url, status_code=302)

@api_router.get("/melhorenvio/callback")
async def melhorenvio_callback(request: Request, code: str | None = None, state: str | None = None):
    require_me_config()

    if not code:
        raise HTTPException(status_code=400, detail="Missing 'code' in callback.")
    if not state:
        raise HTTPException(status_code=400, detail="Missing 'state' in callback.")

    ok = await pop_oauth_state(state)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid/expired state.")

    data = {
        "grant_type": "authorization_code",
        "client_id": MELHOR_ENVIO_CLIENT_ID,
        "client_secret": MELHOR_ENVIO_CLIENT_SECRET,
        "redirect_uri": get_redirect_uri(),
        "code": code,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(ME_TOKEN_URL, data=data)
            if resp.status_code >= 400:
                return JSONResponse(
                    status_code=resp.status_code,
                    content={"error": "token_exchange_failed", "details": resp.text},
                )
            payload = resp.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Error calling Melhor Envio token endpoint: {str(e)}")

    await save_token(payload)

    return {
        "ok": True,
        "message": "Token salvo com sucesso no MongoDB.",
        "redirect_uri_used": get_redirect_uri(),
        "sandbox": MELHOR_ENVIO_SANDBOX,
        "scope_from_token": payload.get("scope"),
        "token_type_from_token": payload.get("token_type"),
    }

@api_router.get("/melhorenvio/token")
async def melhorenvio_token_status():
    database = ensure_db()
    doc = await database.melhorenvio_tokens.find_one({"_id": "current"}, {"_id": 0})
    if not doc:
        return {"connected": False}

    access_token = str(doc.get("access_token") or "")
    return {
        "connected": True,
        "sandbox": bool(doc.get("sandbox")),
        "updated_at": doc.get("updated_at"),
        "expires_at": doc.get("expires_at"),
        "has_refresh_token": bool(doc.get("refresh_token")),
        "token_type": doc.get("token_type"),
        "scope": doc.get("scope"),
        "has_access_token": bool(access_token.strip()),
        "access_token_len": len(access_token.strip()),
    }

# ---------------------------
# Products endpoints
# ---------------------------
@api_router.post("/products", response_model=ProductOut)
async def create_product(payload: ProductCreate):
    database = ensure_db()
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    res = await database.products.insert_one(doc)
    return ProductOut(id=str(res.inserted_id), **payload.model_dump())

@api_router.get("/products", response_model=list[ProductOut])
async def list_products(limit: int = 50):
    database = ensure_db()
    items = await database.products.find({}).limit(limit).to_list(limit)

    out: list[ProductOut] = []
    for it in items:
        out.append(
            ProductOut(
                id=str(it["_id"]),
                name=it["name"],
                price=float(it["price"]),
                weight_kg=float(it["weight_kg"]),
                width_cm=float(it["width_cm"]),
                height_cm=float(it["height_cm"]),
                length_cm=float(it["length_cm"]),
                sku=it.get("sku"),
                image=it.get("image"),
            )
        )
    return out

# ---------------------------
# Shipping Quote endpoint (Melhor Envio)
# ---------------------------
@api_router.post("/shipping/quote", response_model=QuoteResponse)
async def shipping_quote(body: QuoteRequest):
    require_me_config()

    to_cep = sanitize_cep(body.to_cep)
    if len(to_cep) != 8:
        raise HTTPException(status_code=400, detail="to_cep inválido (precisa 8 dígitos).")

    if body.quantity < 1:
        raise HTTPException(status_code=400, detail="quantity precisa ser >= 1.")

    database = ensure_db()
    try:
        _id = ObjectId(body.product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="product_id inválido (ObjectId).")

    prod = await database.products.find_one({"_id": _id})
    if not prod:
        raise HTTPException(status_code=404, detail="Produto não encontrado no Mongo.")

    from_cep = sanitize_cep(MELHOR_ENVIO_FROM_CEP)

    insurance_value = body.insurance_value
    if insurance_value is None:
        insurance_value = float(prod.get("price", 0)) * int(body.quantity)

    payload: Dict[str, Any] = {
        "from": {"postal_code": from_cep},
        "to": {"postal_code": to_cep},
        "products": [
            {
                "id": str(body.product_id),
                "width": float(prod["width_cm"]),
                "height": float(prod["height_cm"]),
                "length": float(prod["length_cm"]),
                "weight": float(prod["weight_kg"]),
                "insurance_value": float(insurance_value),
                "quantity": int(body.quantity),
            }
        ],
    }

    token_doc = await get_current_token_doc()

    url = f"{ME_BASE}/api/v2/me/shipment/calculate"
    headers = {
        "Authorization": build_auth_header(token_doc),
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": MELHOR_ENVIO_USER_AGENT,
    }

    async with httpx.AsyncClient(timeout=30) as http:
        r = await http.post(url, json=payload, headers=headers)

    if r.status_code >= 400:
        logger.error("ME quote error %s: %s", r.status_code, r.text)
        raise HTTPException(status_code=r.status_code, detail=r.text)

    return QuoteResponse(raw=r.json())

# ---------------------------
# Shipping Create (Cart) endpoint (Melhor Envio)
# ---------------------------
@api_router.post("/shipping/create", response_model=CreateShipmentResponse)
async def shipping_create(body: CreateShipmentRequest):
    require_me_config()
    require_sender_config_for_cart()

    to_cep = sanitize_cep(body.to_cep)
    if len(to_cep) != 8:
        raise HTTPException(status_code=400, detail="to_cep inválido (precisa 8 dígitos).")

    if body.quantity < 1:
        raise HTTPException(status_code=400, detail="quantity precisa ser >= 1.")

    receiver_document = sanitize_document(body.receiver_document)
    if len(receiver_document) not in (11, 14):
        raise HTTPException(status_code=400, detail="receiver_document inválido (use CPF 11 dígitos ou CNPJ 14 dígitos).")

    from_obj = build_sender_from_env()

    database = ensure_db()
    try:
        _id = ObjectId(body.product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="product_id inválido (ObjectId).")

    prod = await database.products.find_one({"_id": _id})
    if not prod:
        raise HTTPException(status_code=404, detail="Produto não encontrado no Mongo.")

    insurance_value = body.insurance_value
    if insurance_value is None:
        insurance_value = float(prod.get("price", 0)) * int(body.quantity)

    payload: Dict[str, Any] = {
        "service": int(body.service_id),
        "from": from_obj,
        "to": {
            "name": body.receiver_name,
            "phone": body.receiver_phone,
            "email": body.receiver_email,
            "document": receiver_document,
            "address": body.receiver_address,
            "number": body.receiver_number,
            "complement": body.receiver_complement,
            "district": body.receiver_district,
            "city": body.receiver_city,
            "state_abbr": body.receiver_state,
            "postal_code": to_cep,
        },
        "products": [
            {
                "name": prod["name"],
                "quantity": int(body.quantity),
                "unitary_value": float(prod.get("price", 0)),
                "weight": float(prod["weight_kg"]),
                "width": float(prod["width_cm"]),
                "height": float(prod["height_cm"]),
                "length": float(prod["length_cm"]),
            }
        ],
        "options": {
            "insurance_value": float(insurance_value),
            "receipt": False,
            "own_hand": False,
            "collect": False,
        },
    }

    token_doc = await get_current_token_doc()

    url = f"{ME_BASE}/api/v2/me/cart"
    headers = {
        "Authorization": build_auth_header(token_doc),
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": MELHOR_ENVIO_USER_AGENT,
    }

    async with httpx.AsyncClient(timeout=30) as http:
        r = await http.post(url, json=payload, headers=headers)

    if r.status_code >= 400:
        logger.error("ME cart create error %s: %s", r.status_code, r.text)
        raise HTTPException(status_code=r.status_code, detail=r.text)

    raw = r.json()

    await database.melhorenvio_shipments.insert_one(
        {
            "created_at": datetime.now(timezone.utc).isoformat(),
            "request": payload,
            "response": raw,
            "sandbox": MELHOR_ENVIO_SANDBOX,
        }
    )

    return CreateShipmentResponse(raw=raw)

# ---------------------------
# Shipping Cart (list)
# ---------------------------
@api_router.get("/shipping/cart", response_model=CartResponse)
async def shipping_cart_list():
    """
    Lista o carrinho do Melhor Envio.
    Endpoint: GET /api/v2/me/cart
    """
    require_me_config()

    token_doc = await get_current_token_doc()

    url = f"{ME_BASE}/api/v2/me/cart"
    headers = {
        "Authorization": build_auth_header(token_doc),
        "Accept": "application/json",
        "User-Agent": MELHOR_ENVIO_USER_AGENT,
    }

    async with httpx.AsyncClient(timeout=30) as http:
        r = await http.get(url, headers=headers)

    if r.status_code >= 400:
        logger.error("ME cart list error %s: %s", r.status_code, r.text)
        raise HTTPException(status_code=r.status_code, detail=r.text)

    return CartResponse(raw=r.json())

# ---------------------------
# ✅ NEW: Shipping Checkout (Melhor Envio)
# ---------------------------
@api_router.post("/shipping/checkout", response_model=CheckoutResponse)
async def shipping_checkout(body: CheckoutRequest):
    """
    Checkout/pagamento dos envios do carrinho.
    Melhor Envio: POST /api/v2/me/shipment/checkout
    Body: { "orders": ["id1", "id2"] }
    Se orders vier vazio, faz checkout de tudo que estiver no carrinho.
    """
    require_me_config()

    token_doc = await get_current_token_doc()
    database = ensure_db()

    orders = [str(x).strip() for x in (body.orders or []) if str(x).strip()]

    # Se não vier orders, pega do carrinho automaticamente
    if not orders:
        cart_url = f"{ME_BASE}/api/v2/me/cart"
        cart_headers = {
            "Authorization": build_auth_header(token_doc),
            "Accept": "application/json",
            "User-Agent": MELHOR_ENVIO_USER_AGENT,
        }
        async with httpx.AsyncClient(timeout=30) as http:
            cart_resp = await http.get(cart_url, headers=cart_headers)

        if cart_resp.status_code >= 400:
            logger.error("ME cart list error %s: %s", cart_resp.status_code, cart_resp.text)
            raise HTTPException(status_code=cart_resp.status_code, detail=cart_resp.text)

        cart = cart_resp.json() or {}
        data = cart.get("data") or []
        orders = [str(it.get("id")).strip() for it in data if it.get("id")]

    if not orders:
        raise HTTPException(status_code=400, detail="Carrinho vazio: não há orders para checkout.")

    payload = {"orders": orders}

    url = f"{ME_BASE}/api/v2/me/shipment/checkout"
    headers = {
        "Authorization": build_auth_header(token_doc),
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": MELHOR_ENVIO_USER_AGENT,
    }

    async with httpx.AsyncClient(timeout=30) as http:
        r = await http.post(url, json=payload, headers=headers)

    if r.status_code >= 400:
        logger.error("ME checkout error %s: %s", r.status_code, r.text)
        raise HTTPException(status_code=r.status_code, detail=r.text)

    raw = r.json()

    # histórico no Mongo
    await database.melhorenvio_checkouts.insert_one(
        {
            "created_at": datetime.now(timezone.utc).isoformat(),
            "request": payload,
            "response": raw,
            "sandbox": MELHOR_ENVIO_SANDBOX,
        }
    )

    return CheckoutResponse(raw=raw)

# ---------------------------
# FastAPI setup
# ---------------------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS.split(",")] if CORS_ORIGINS else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    global client
    if client is not None:
        client.close()
        client = None
        logger.info("Mongo client closed.")