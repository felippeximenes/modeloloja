from __future__ import annotations

import httpx
from fastapi import HTTPException
from app.core import config

MERCADO_PAGO_BASE = "https://api.mercadopago.com"


# =========================
# CREATE PREFERENCE
# =========================
async def create_preference(order: dict):

    if not config.MP_ACCESS_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="MercadoPago access token não configurado."
        )

    url = f"{MERCADO_PAGO_BASE}/checkout/preferences"

    headers = {
        "Authorization": f"Bearer {config.MP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    # =========================
    # BUILD ITEMS
    # =========================

    items = []

    for item in order["items"]:
        items.append({
            "title": item.get("name", "Produto"),
            "quantity": int(item["quantity"]),
            "unit_price": float(item["unit_price"]),
            "currency_id": "BRL",
        })

    # =========================
    # URLS
    # =========================

    success_url = f"{config.FRONTEND_URL}/payment/success"
    failure_url = f"{config.FRONTEND_URL}/payment/failure"
    pending_url = f"{config.FRONTEND_URL}/payment/pending"

    # =========================
    # PAYLOAD
    # =========================

    payload = {
        "items": items,

        "external_reference": str(order["_id"]),

        "back_urls": {
            "success": success_url,
            "failure": failure_url,
            "pending": pending_url,
        },

        # REMOVIDO TEMPORARIAMENTE
        # auto_return não funciona com localhost
        # "auto_return": "approved",

        "notification_url": f"{config.API_BASE_URL}/api/payments/webhook",

        # Identificador que aparece na fatura do cliente
        "statement_descriptor": "MOLDZ3D",

        # Evita pagamento duplicado
        "binary_mode": True
    }

    # =========================
    # REQUEST
    # =========================

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            url,
            json=payload,
            headers=headers
        )

    # =========================
    # ERROR HANDLING
    # =========================

    if response.status_code >= 400:
        print("❌ MERCADO PAGO ERROR")
        print(response.text)

        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )

    return response.json()


# =========================
# GET PAYMENT DETAILS
# =========================
async def get_payment(payment_id: str):

    if not config.MP_ACCESS_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="MercadoPago access token não configurado."
        )

    url = f"{MERCADO_PAGO_BASE}/v1/payments/{payment_id}"

    headers = {
        "Authorization": f"Bearer {config.MP_ACCESS_TOKEN}",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, headers=headers)

    if response.status_code >= 400:
        print("❌ MERCADO PAGO GET PAYMENT ERROR")
        print(response.text)

        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )

    return response.json()