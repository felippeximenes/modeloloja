from __future__ import annotations

import httpx
from fastapi import HTTPException
from app.core import config

MERCADO_PAGO_BASE = "https://api.mercadopago.com"


async def create_preference(order: dict):
    url = f"{MERCADO_PAGO_BASE}/checkout/preferences"

    headers = {
        "Authorization": f"Bearer {config.MP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "items": [
            {
                "title": f"Pedido {order['_id']}",
                "quantity": 1,
                "unit_price": float(order["total"]),
                "currency_id": "BRL",
            }
        ],
        "external_reference": str(order["_id"]),
        "notification_url": f"{config.API_BASE_URL}/api/payments/webhook"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )

    return response.json()


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