from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from bson import ObjectId

from app.db.mongo import get_db
from app.services.payment_service import create_preference, get_payment

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("/{order_id}/create")
async def create_payment(order_id: str):
    db = get_db()

    try:
        _id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="order_id inválido.")

    order = await db.orders.find_one({"_id": _id})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    preference = await create_preference(order)

    await db.orders.update_one(
        {"_id": _id},
        {"$set": {
            "mercado_pago.preference_id": preference.get("id"),
            "mercado_pago.init_point": preference.get("init_point")
        }}
    )

    return {
        "checkout_url": preference.get("init_point"),
        "sandbox_url": preference.get("sandbox_init_point")
    }


@router.post("/webhook")
async def mercado_pago_webhook(request: Request):
    db = get_db()
    data = await request.json()

    if data.get("type") != "payment":
        return {"ok": True}

    payment_id = data.get("data", {}).get("id")
    if not payment_id:
        return {"ok": True}

    payment = await get_payment(payment_id)

    order_id = payment.get("external_reference")
    status = payment.get("status")

    if not order_id:
        return {"ok": True}

    try:
        _id = ObjectId(order_id)
    except Exception:
        return {"ok": True}

    if status == "approved":
        await db.orders.update_one(
            {"_id": _id},
            {"$set": {"status": "paid"}}
        )

    return {"ok": True}