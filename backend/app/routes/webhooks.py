from __future__ import annotations

import hmac
import hashlib

from fastapi import APIRouter, Request, HTTPException

from app.db.mongo import get_db
from app.core import config
from app.services.order_service import update_order_status

router = APIRouter(
    prefix="/api/webhooks",
    tags=["webhooks"]
)


def verify_signature(body: bytes, signature: str):

    if not signature:
        return False

    expected = hmac.new(
        config.MELHOR_ENVIO_CLIENT_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected, signature)


@router.post("/melhorenvio")
async def melhor_envio_webhook(request: Request):

    body = await request.body()

    signature = request.headers.get("X-ME-Signature")

# permitir testes locais sem assinatura
    if signature:
        if not verify_signature(body, signature):
            raise HTTPException(status_code=401, detail="Invalid signature")

    data = await request.json()

    event = data.get("event")
    resource = data.get("resource")

    if not resource:
        return {"status": "ignored"}

    order_id_me = str(resource.get("id"))

    db = get_db()

    order = await db.orders.find_one({
        "melhor_envio.cart_order_ids": order_id_me
    })

    if not order:
        return {"status": "order_not_found"}

    update = {}

    if event == "order.posted":
        update["status"] = "shipped"

    elif event == "order.delivered":
        update["status"] = "delivered"

    elif event == "order.cancelled":
        update["status"] = "cancelled"

    if update:

        await db.orders.update_one(
            {"_id": order["_id"]},
            {"$set": update}
        )

    return {
        "status": "ok"
    }

# =================================
# PAYMENT WEBHOOK
# =================================

@router.post("/payment")
async def payment_webhook(request: Request):

    data = await request.json()

    event = data.get("event")
    payment_id = data.get("payment_id")
    order_id = data.get("order_id")

    if not order_id:
        raise HTTPException(status_code=400, detail="order_id missing")

    db = get_db()

    if event == "payment.approved":

        await update_order_status(
            db,
            order_id,
            "paid",
            meta={
                "payment_id": payment_id
            }
        )

        return {
            "status": "payment_confirmed",
            "order_id": order_id
        }

    return {
        "status": "ignored"
    }