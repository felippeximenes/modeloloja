from __future__ import annotations

import httpx
from fastapi import HTTPException
from app.core import config

MERCADO_PAGO_BASE = "https://api.mercadopago.com"


# =========================
# CREATE PREFERENCE
# =========================
async def create_preference(order: dict):

    url = f"{MERCADO_PAGO_BASE}/checkout/preferences"

    headers = {
        "Authorization": f"Bearer {config.MP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    # Agora enviamos item por item
    items = []

    for item in order["items"]:
        items.append({
            "title": item["name"],
            "quantity": item["quantity"],
            "unit_price": float(item["unit_price"]),
            "currency_id": "BRL",
        })

    payload = {
        "items": items,
        "external_reference": str(order["_id"]),

        # URLs de retorno
        "back_urls": {
            "success": f"{config.FRONTEND_URL}/payment/success",
            "failure": f"{config.FRONTEND_URL}/payment/failure",
            "pending": f"{config.FRONTEND_URL}/payment/pending",
        },

        "auto_return": "approved",

        # Webhook
        "notification_url": f"{config.API_BASE_URL}/api/payments/webhook",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )

    return response.json()


# =========================
# GET PAYMENT DETAILS
# =========================
async def get_payment(payment_id: str):

    url = f"{MERCADO_PAGO_BASE}/v1/payments/{payment_id}"

    headers = {
        "Authorization": f"Bearer {config.MP_ACCESS_TOKEN}",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )

    return response.json()