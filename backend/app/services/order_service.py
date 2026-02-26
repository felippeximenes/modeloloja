from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import HTTPException


# ---------------------------
# Helpers internos
# ---------------------------

def _utcnow():
    return datetime.now(timezone.utc)


def _sanitize_cep(value: str) -> str:
    return "".join([c for c in str(value or "") if c.isdigit()])[:8]


async def _load_product(db, product_id: str) -> dict:
    try:
        _id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="product_id inválido (ObjectId).")

    prod = await db.products.find_one({"_id": _id})
    if not prod:
        raise HTTPException(status_code=404, detail=f"Produto não encontrado: {product_id}")

    return prod


# ---------------------------
# Core
# ---------------------------

async def create_order(db, payload: dict) -> dict:
    if not payload.get("items"):
        raise HTTPException(status_code=400, detail="items não pode ser vazio.")

    # valida CEP
    to_cep = _sanitize_cep(payload["address"]["to_cep"])
    if len(to_cep) != 8:
        raise HTTPException(status_code=400, detail="to_cep inválido (precisa 8 dígitos).")

    payload["address"]["to_cep"] = to_cep

    # montar itens + subtotal
    items_out: list[dict[str, Any]] = []
    subtotal = 0.0

    for it in payload["items"]:
        qty = int(it.get("quantity", 1))

        if qty < 1:
            raise HTTPException(status_code=400, detail="quantity precisa ser >= 1.")

        prod = await _load_product(db, it["product_id"])

        unit_price = float(prod.get("price", 0))
        subtotal += unit_price * qty

        items_out.append({
            "product_id": str(prod["_id"]),
            "name": prod.get("name"),
            "quantity": qty,
            "unit_price": unit_price,
            "weight_kg": float(prod.get("weight_kg", 0)),
            "width_cm": float(prod.get("width_cm", 0)),
            "height_cm": float(prod.get("height_cm", 0)),
            "length_cm": float(prod.get("length_cm", 0)),
        })

    shipping_price = float(payload["shipping"]["price"])
    total = float(subtotal + shipping_price)

    now = _utcnow()

    doc = {
        "status": "created",  # futuramente: created → paid → shipped
        "items": items_out,
        "address": payload["address"],
        "shipping": payload["shipping"],
        "subtotal": float(subtotal),
        "shipping_price": float(shipping_price),
        "total": float(total),
        "payment": {
            "provider": None,
            "payment_id": None,
            "status": None,
        },
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


async def get_order(db, order_id: str) -> dict:
    try:
        _id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="order_id inválido (ObjectId).")

    doc = await db.orders.find_one({"_id": _id})
    if not doc:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    return doc

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

    update_data = {
        "status": status,
        "updated_at": _utcnow().isoformat(),
    }

    if meta:
        update_data["meta"] = meta

    res = await db.orders.find_one_and_update(
        {"_id": _id},
        {"$set": update_data},
        return_document=True
    )

    if not res:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    return res