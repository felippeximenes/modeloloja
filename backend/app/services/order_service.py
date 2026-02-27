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


async def _load_product(db, product_id: str) -> dict:
    try:
        _id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="product_id inválido (ObjectId).")

    prod = await db.products.find_one({"_id": _id})
    if not prod:
        raise HTTPException(status_code=404, detail=f"Produto não encontrado: {product_id}")
    return prod


# =========================
# CREATE ORDER
# =========================
async def create_order(db, payload: dict) -> dict:
    if not payload.get("items"):
        raise HTTPException(status_code=400, detail="items não pode ser vazio.")

    to_cep = sanitize_cep(payload["address"]["to_cep"])
    if len(to_cep) != 8:
        raise HTTPException(status_code=400, detail="to_cep inválido (precisa 8 dígitos).")

    payload["address"]["to_cep"] = to_cep

    items_out: list[dict[str, Any]] = []
    subtotal = 0.0

    for it in payload["items"]:
        qty = int(it.get("quantity", 1))
        if qty < 1:
            raise HTTPException(status_code=400, detail="quantity precisa ser >= 1.")

        if not it.get("sku"):
            raise HTTPException(status_code=400, detail="sku é obrigatório.")

        prod = await _load_product(db, it["product_id"])

        # 🔎 Encontrar variação correta
        variation = next(
            (v for v in prod.get("variations", [])
             if v["sku"] == it["sku"] and v.get("active", True)),
            None
        )

        if not variation:
            raise HTTPException(
                status_code=404,
                detail=f"Variação não encontrada: {it['sku']}"
            )

        # 📦 Controle de estoque
        if variation["stock"] < qty:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente para {it['sku']}"
            )

        unit_price = float(variation["price"])
        subtotal += unit_price * qty

        # 🔻 Decrementar estoque da variação
        await db.products.update_one(
            {
                "_id": prod["_id"],
                "variations.sku": it["sku"]
            },
            {
                "$inc": {"variations.$.stock": -qty}
            }
        )

        # 🧾 Snapshot do item
        items_out.append({
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
        })

    shipping_price = float(payload["shipping"]["price"])
    total = subtotal + shipping_price

    now = _utcnow()

    doc = {
        "status": "created",
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
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }

    res = await db.orders.insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc

# =========================
# MELHOR ENVIO CART
# =========================
async def _create_melhor_envio_cart(db, order: dict):

    me.require_me_config()
    me.require_sender_config_for_cart()

    token_doc = await me.get_current_token_doc()
    created_ids = []

    for item in order["items"]:

        payload = {
            "service": order["shipping"]["service_id"],
            "from": me.build_sender_from_env(),
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
                "state_abbr": order["address"]["receiver_state"],
                "postal_code": order["address"]["to_cep"],
            },
            "products": [
                {
                    "name": item["name"],
                    "quantity": item["quantity"],
                    "unitary_value": item["unit_price"],
                    "weight": item["weight_kg"],
                    "width": item["width_cm"],
                    "height": item["height_cm"],
                    "length": item["length_cm"],
                }
            ],
            "options": {
                "insurance_value": float(order["total"]),
                "receipt": False,
                "own_hand": False,
                "collect": False,
            },
        }

        url = f"{config.ME_BASE}/api/v2/me/cart"
        r = await me.http_post(url, payload, token_doc)

        if r.status_code >= 400:
            raise HTTPException(status_code=r.status_code, detail=r.text)

        response = r.json()
        if response.get("id"):
            created_ids.append(str(response["id"]))

    return created_ids


# =========================
# UPDATE STATUS
# =========================
async def update_order_status(db, order_id: str, status: str, meta: dict | None = None) -> dict:
    try:
        _id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="order_id inválido (ObjectId).")

    allowed_status = ["created", "paid", "shipped", "delivered", "cancelled"]

    if status not in allowed_status:
        raise HTTPException(
            status_code=400,
            detail=f"status inválido. Permitidos: {allowed_status}"
        )

    order = await db.orders.find_one({"_id": _id})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    update_data = {
        "status": status,
        "updated_at": _utcnow().isoformat(),
    }

    # Se virar pago → cria no Melhor Envio
    if status == "paid" and not order["melhor_envio"]["cart_order_ids"]:
        cart_ids = await _create_melhor_envio_cart(db, order)
        update_data["melhor_envio.cart_order_ids"] = cart_ids

    if meta:
        update_data["meta"] = meta

    await db.orders.update_one({"_id": _id}, {"$set": update_data})

    return await db.orders.find_one({"_id": _id})


# =========================
# GET ORDER
# =========================
async def get_order(db, order_id: str) -> dict:
    try:
        _id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="order_id inválido (ObjectId).")

    doc = await db.orders.find_one({"_id": _id})
    if not doc:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")
    return doc


# =========================
# OUTPUT
# =========================
def to_order_out(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "status": doc["status"],
        "items": doc["items"],
        "address": doc["address"],
        "shipping": doc["shipping"],
        "subtotal": float(doc["subtotal"]),
        "shipping_price": float(doc["shipping_price"]),
        "total": float(doc["total"]),
        "created_at": datetime.fromisoformat(doc["created_at"]),
        "updated_at": datetime.fromisoformat(doc["updated_at"]),
    }