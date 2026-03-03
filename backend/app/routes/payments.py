from __future__ import annotations

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request
from bson import ObjectId

from app.db.mongo import get_db
from app.services.payment_service import create_preference, get_payment

router = APIRouter(prefix="/api/payments", tags=["payments"])


# =========================
# CREATE PAYMENT (Generate MercadoPago Checkout)
# =========================
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

    # 🔥 Criar preferência no MercadoPago
    preference = await create_preference(order)

    # 🔥 Salvar dados do pagamento no pedido
    await db.orders.update_one(
        {"_id": _id},
        {
            "$set": {
                "payment_id": preference.get("id"),
                "payment_provider": "mercadopago",
                "updated_at": datetime.now(timezone.utc),
                "mercado_pago": {
                    "preference_id": preference.get("id"),
                    "init_point": preference.get("init_point"),
                    "sandbox_init_point": preference.get("sandbox_init_point"),
                },
            }
        },
    )

    return {
        "checkout_url": preference.get("init_point"),
        "sandbox_url": preference.get("sandbox_init_point"),
    }


# =========================
# WEBHOOK (MercadoPago)
# =========================
@router.post("/webhook")
async def mercado_pago_webhook(request: Request):
    db = get_db()

    data = await request.json()

    # MercadoPago envia vários tipos de notificação
    if data.get("type") != "payment":
        return {"ok": True}

    payment_id = data.get("data", {}).get("id")
    if not payment_id:
        return {"ok": True}

    #  Buscar detalhes completos do pagamento
    payment = await get_payment(payment_id)

    order_id = payment.get("external_reference")
    payment_status = payment.get("status")

    if not order_id:
        return {"ok": True}

    try:
        _id = ObjectId(order_id)
    except Exception:
        return {"ok": True}

    # 🔥 Atualizar apenas se aprovado
    if payment_status == "approved":
        await db.orders.update_one(
            {"_id": _id},
            {
                "$set": {
                    "status": "paid",
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

    return {"ok": True}