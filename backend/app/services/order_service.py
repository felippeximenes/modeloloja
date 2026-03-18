from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import HTTPException

from app.utils.validators import sanitize_cep
from app.services import melhor_envio as me
from app.core import config

def _utcnow():
    return datetime.now(timezone.utc)

STATE_MAP = {
    "rio de janeiro": "RJ",
    "são paulo": "SP",
    "sao paulo": "SP",
    "minas gerais": "MG",
    "espírito santo": "ES",
    "espirito santo": "ES",
    "paraná": "PR",
    "parana": "PR",
    "rio grande do sul": "RS",
    "santa catarina": "SC",
    "bahia": "BA",
}

def normalize_state(state: str) -> str:
    if not state:
        return ""

    state_lower = state.lower().strip()

    if len(state) == 2:
        return state.upper()

    return STATE_MAP.get(state_lower, state[:2].upper())

def normalize_cep(cep: str) -> str:
    cep = sanitize_cep(cep)

    if len(cep) != 8:
        raise HTTPException(status_code=400, detail="CEP inválido.")

    return cep

async def _load_product(db, product_id: str) -> dict:
    try:
        _id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="product_id inválido.")

    prod = await db.products.find_one({"_id": _id})

    if not prod:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    return prod

# =================================
# CREATE ORDER
# =================================

async def create_order(db, payload: dict) -> dict:
    if not payload.get("items"):
        raise HTTPException(status_code=400, detail="items não pode ser vazio.")

    if not payload.get("user_id"):
        raise HTTPException(status_code=401, detail="Usuário não autenticado.")

    cep = normalize_cep(payload["address"]["to_cep"])
    payload["address"]["to_cep"] = cep

    items_out: list[dict[str, Any]] = []
    subtotal = 0.0

    for it in payload["items"]:
        qty = int(it.get("quantity", 1))

        prod = await _load_product(db, it["product_id"])

        variation = next(
            (
                v for v in prod.get("variations", [])
                if v["sku"] == it["sku"] and v.get("active", True)
            ),
            None,
        )

        if not variation:
            raise HTTPException(
                status_code=404,
                detail=f"Variação não encontrada: {it['sku']}",
            )

        if variation["stock"] < qty:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente para {it['sku']}",
            )

        unit_price = float(variation["price"])
        subtotal += unit_price * qty

        await db.products.update_one(
            {
                "_id": prod["_id"],
                "variations.sku": it["sku"],
            },
            {
                "$inc": {"variations.$.stock": -qty},
            },
        )

        items_out.append(
            {
                "product_id": str(prod["_id"]),
                "sku": it["sku"],
                "name": prod.get("name"),
                "model": variation.get("model"),
                "color": variation.get("color"),
                "size": variation.get("size"),
                "quantity": qty,
                "unit_price": unit_price,
                "weight_kg": float(variation.get("weight_kg", 0)),
                "width_cm": float(variation.get("width_cm", 0)),
                "height_cm": float(variation.get("height_cm", 0)),
                "length_cm": float(variation.get("length_cm", 0)),
            }
        )

    shipping_price = float(payload["shipping"]["price"])
    total = subtotal + shipping_price

    now = _utcnow()

    doc = {
        "user_id": payload["user_id"],
        "status": "created",
        "payment_status": "unpaid",
        "payment_id": None,
        "payment_provider": None,
        "items": items_out,
        "address": payload["address"],
        "shipping": payload["shipping"],
        "subtotal": subtotal,
        "shipping_price": shipping_price,
        "total": total,
        "melhor_envio": {
            "cart_order_ids": [],
            "checkout": None,
            "label": None,
        },
        "created_at": now,
        "updated_at": now,
    }

    res = await db.orders.insert_one(doc)
    doc["_id"] = res.inserted_id

    return doc

# =================================
# CREATE MELHOR ENVIO CART
# =================================

async def _create_melhor_envio_cart(db, order: dict):
    token_doc = await me.get_current_token_doc()

    created_ids = []

    sender = {
        "name": config.ME_FROM_NAME,
        "phone": config.ME_FROM_PHONE,
        "email": config.ME_FROM_EMAIL,
        "address": config.ME_FROM_ADDRESS,
        "number": config.ME_FROM_NUMBER,
        "complement": config.ME_FROM_COMPLEMENT,
        "district": config.ME_FROM_DISTRICT,
        "city": config.ME_FROM_CITY,
        "state_abbr": config.ME_FROM_STATE,
        "postal_code": normalize_cep(config.MELHOR_ENVIO_FROM_CEP),
    }

    state = normalize_state(order["address"]["receiver_state"])
    cep = normalize_cep(order["address"]["to_cep"])

    for item in order["items"]:
        payload = {
            "service": int(order["shipping"]["service_id"]),
            "from": sender,
            "to": {
                "name": order["address"]["receiver_name"],
                "phone": order["address"]["receiver_phone"],
                "email": order["address"].get("receiver_email"),
                "document": order["address"]["receiver_document"],
                "address": order["address"]["receiver_address"],
                "number": order["address"]["receiver_number"],
                "complement": order["address"].get("receiver_complement"),
                "district": order["address"]["receiver_district"],
                "city": order["address"]["receiver_city"],
                "state_abbr": state,
                "postal_code": cep,
            },
            "products": [
                {
                    "name": item["name"],
                    "quantity": int(item["quantity"]),
                    "unitary_value": float(item["unit_price"]),
                    "weight": float(item["weight_kg"]),
                    "width": float(item["width_cm"]),
                    "height": float(item["height_cm"]),
                    "length": float(item["length_cm"]),
                }
            ],
            "options": {
                "insurance_value": float(order["total"]),
                "receipt": False,
                "own_hand": False,
            },
        }

        url = f"{config.ME_BASE}/api/v2/me/cart"
        r = await me.http_post(url, payload, token_doc)

        if r.status_code >= 400:
            print("❌ MELHOR ENVIO ERROR")
            print(r.text)
            raise HTTPException(status_code=r.status_code, detail=r.text)

        response = r.json()

        if response.get("id"):
            created_ids.append(str(response["id"]))

    return created_ids

# =================================
# GET ORDER
# =================================

async def get_order(db, order_id: str) -> dict:
    try:
        _id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="order_id inválido.")

    doc = await db.orders.find_one({"_id": _id})

    if not doc:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    return doc

# =================================
# UPDATE STATUS
# =================================

async def update_order_status(db, order_id: str, status: str, meta: dict | None = None) -> dict:
    try:
        _id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="order_id inválido.")

    order = await db.orders.find_one({"_id": _id})

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    update_data = {
        "status": status,
        "updated_at": _utcnow(),
    }

    if status == "paid":
        update_data["payment_status"] = "paid"

        if not order.get("melhor_envio", {}).get("cart_order_ids"):
            cart_ids = await _create_melhor_envio_cart(db, order)
            update_data["melhor_envio.cart_order_ids"] = cart_ids

    await db.orders.update_one(
        {"_id": _id},
        {"$set": update_data},
    )

    return await db.orders.find_one({"_id": _id})

# =================================
# OUTPUT
# =================================

def to_order_out(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "status": doc["status"],
        "payment_status": doc.get("payment_status", "unpaid"),
        "payment_id": doc.get("payment_id"),
        "payment_provider": doc.get("payment_provider"),
        "items": doc["items"],
        "address": doc["address"],
        "shipping": doc["shipping"],
        "subtotal": float(doc["subtotal"]),
        "shipping_price": float(doc["shipping_price"]),
        "total": float(doc["total"]),
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
    }

# =================================
# LISTAR ORDERS (ADMIN)
# =================================

async def list_orders(db, status: str | None = None):
    query = {}

    if status:
        query["status"] = status

    cursor = db.orders.find(query).sort("created_at", -1)

    orders = []

    async for doc in cursor:
        orders.append(
            {
                "id": str(doc["_id"]),
                "user_id": doc.get("user_id"),
                "status": doc.get("status"),
                "payment_status": doc.get("payment_status"),
                "total": doc.get("total"),
                "shipping_price": doc.get("shipping_price"),
                "created_at": doc.get("created_at"),
                "receiver": doc.get("address", {}).get("receiver_name"),
                "tracking_code": doc.get("melhor_envio", {}).get("tracking_code"),
            }
        )

    return orders

# =================================
# LIST MY ORDERS
# =================================

async def list_orders_by_user(db, user_id: str):
    cursor = db.orders.find({"user_id": user_id}).sort("created_at", -1)

    orders = []

    async for doc in cursor:
        orders.append(
            {
                "id": str(doc["_id"]),
                "status": doc.get("status"),
                "payment_status": doc.get("payment_status"),
                "total": doc.get("total"),
                "shipping_price": doc.get("shipping_price"),
                "created_at": doc.get("created_at"),
                "receiver": doc.get("address", {}).get("receiver_name"),
                "items_count": len(doc.get("items", [])),
            }
        )

    return orders

# =================================
# GET LABEL FROM MELHOR ENVIO
# =================================

async def get_order_label(db, order_id: str):
    try:
        _id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="order_id inválido.")

    order = await db.orders.find_one({"_id": _id})

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    cart_ids = order.get("melhor_envio", {}).get("cart_order_ids")

    if not cart_ids:
        raise HTTPException(
            status_code=400,
            detail="Pedido ainda não possui envio criado."
        )

    token_doc = await me.get_current_token_doc()
    order_id_me = cart_ids[0]

    url = f"{config.ME_BASE}/api/v2/me/shipment/print/{order_id_me}"
    r = await me.http_get(url, token_doc)

    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    try:
        return r.json()
    except Exception:
        return {
            "label_url": r.text
        }

# =================================
# GET TRACKING
# =================================

async def get_order_tracking(db, order_id: str):
    try:
        _id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="order_id inválido.")

    order = await db.orders.find_one({"_id": _id})

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    cart_ids = order.get("melhor_envio", {}).get("cart_order_ids")

    if not cart_ids:
        raise HTTPException(
            status_code=400,
            detail="Pedido ainda não possui envio criado."
        )

    token_doc = await me.get_current_token_doc()
    order_id_me = cart_ids[0]

    url = f"{config.ME_BASE}/api/v2/me/shipment/tracking/{order_id_me}"
    r = await me.http_get(url, token_doc)

    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    try:
        data = r.json()
    except Exception:
        data = r.text

    return {
        "tracking": data
    }