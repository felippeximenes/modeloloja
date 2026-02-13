from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from urllib.parse import urlencode

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

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

ME_BASE = "https://sandbox.melhorenvio.com.br" if MELHOR_ENVIO_SANDBOX else "https://melhorenvio.com.br"
ME_AUTHORIZE_URL = f"{ME_BASE}/oauth/authorize"
ME_TOKEN_URL = f"{ME_BASE}/oauth/token"  # sandbox: https://sandbox.melhorenvio.com.br/oauth/token :contentReference[oaicite:1]{index=1}

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
    """
    Ensure Mongo client/db exists. Raises HTTPException if MONGO_URL isn't configured.
    """
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
# Models
# ---------------------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


# ---------------------------
# Helpers (Melhor Envio)
# ---------------------------
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


def get_redirect_uri() -> str:
    # Tem que bater 100% com o cadastrado no app do Melhor Envio
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
    """
    Salva 1 token atual (upsert). Em produção você pode salvar por usuário/loja.
    """
    database = ensure_db()

    now = datetime.now(timezone.utc)
    expires_in = token_payload.get("expires_in")  # segundos (se vier)
    expires_at = None
    if isinstance(expires_in, int):
        expires_at = (now.timestamp() + expires_in)

    doc = {
        "access_token": token_payload.get("access_token"),
        "refresh_token": token_payload.get("refresh_token"),
        "token_type": token_payload.get("token_type"),
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
    """
    1) Redireciona o usuário pro Melhor Envio autorizar o app.
    """
    require_me_config()

    state = str(uuid.uuid4())
    await save_oauth_state(state)

    params = {
        "client_id": MELHOR_ENVIO_CLIENT_ID,
        "redirect_uri": get_redirect_uri(),
        "response_type": "code",
        "state": state,
    }
    url = f"{ME_AUTHORIZE_URL}?{urlencode(params)}"
    return RedirectResponse(url=url, status_code=302)


@api_router.get("/melhorenvio/callback")
async def melhorenvio_callback(request: Request, code: str | None = None, state: str | None = None):
    """
    2) Recebe 'code' e troca por token no backend.
    """
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

    # Resposta simples (você pode redirecionar pro seu frontend se quiser)
    return {
        "ok": True,
        "message": "Token salvo com sucesso no MongoDB.",
        "redirect_uri_used": get_redirect_uri(),
        "sandbox": MELHOR_ENVIO_SANDBOX,
    }


@api_router.get("/melhorenvio/token")
async def melhorenvio_token_status():
    """
    Só pra debug: confirma se tem token salvo.
    """
    database = ensure_db()
    doc = await database.melhorenvio_tokens.find_one({"_id": "current"}, {"_id": 0})
    return {"has_token": bool(doc), "token": doc}


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
