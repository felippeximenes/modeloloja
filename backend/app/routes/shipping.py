from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict
from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.core import config
from app.db.mongo import get_db
from app.services import melhor_envio as me
from app.schemas.shipping import (
    QuoteRequest, QuoteResponse,
    CreateShipmentRequest, CreateShipmentResponse,
    CartResponse,
    CheckoutRequest, CheckoutResponse,
    GenerateLabelRequest, GenerateLabelResponse,
    PrintRequest, PrintResponse
)

router = APIRouter(prefix="/api")

@router.post("/shipping/quote", response_model=QuoteResponse)
async def shipping_quote(body: QuoteRequest):
    me.require_me_config()

    to_cep = me.sanitize_cep(body.to_cep)
    if len(to_cep) != 8:
        raise HTTPException(status_code=400, detail="to_cep inválido (precisa 8 dígitos).")
    if body.quantity < 1:
        raise HTTPException(status_code=400, detail="quantity precisa ser >= 1.")

    db = get_db()
    try:
        _id = ObjectId(body.product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="product_id inválido (ObjectId).")

    prod = await db.products.find_one({"_id": _id})
    if not prod:
        raise HTTPException(status_code=404, detail="Produto não encontrado no Mongo.")

    from_cep = me.sanitize_cep(config.MELHOR_ENVIO_FROM_CEP)

    insurance_value = body.insurance_value
    if insurance_value is None:
        insurance_value = float(prod.get("price", 0)) * int(body.quantity)

    payload: Dict[str, Any] = {
        "from": {"postal_code": from_cep},
        "to": {"postal_code": to_cep},
        "products": [
            {
                "id": str(body.product_id),
                "width": float(prod["width_cm"]),
                "height": float(prod["height_cm"]),
                "length": float(prod["length_cm"]),
                "weight": float(prod["weight_kg"]),
                "insurance_value": float(insurance_value),
                "quantity": int(body.quantity),
            }
        ],
    }

    token_doc = await me.get_current_token_doc()
    url = f"{config.ME_BASE}/api/v2/me/shipment/calculate"
    r = await me.http_post(url, payload, token_doc)

    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    return QuoteResponse(raw=r.json())

@router.post("/shipping/create", response_model=CreateShipmentResponse)
async def shipping_create(body: CreateShipmentRequest):
    me.require_me_config()
    me.require_sender_config_for_cart()

    to_cep = me.sanitize_cep(body.to_cep)
    if len(to_cep) != 8:
        raise HTTPException(status_code=400, detail="to_cep inválido (precisa 8 dígitos).")
    if body.quantity < 1:
        raise HTTPException(status_code=400, detail="quantity precisa ser >= 1.")

    receiver_document = me.sanitize_document(body.receiver_document)
    if len(receiver_document) not in (11, 14):
        raise HTTPException(status_code=400, detail="receiver_document inválido (use CPF 11 dígitos ou CNPJ 14 dígitos).")

    from_obj = me.build_sender_from_env()

    db = get_db()
    try:
        _id = ObjectId(body.product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="product_id inválido (ObjectId).")

    prod = await db.products.find_one({"_id": _id})
    if not prod:
        raise HTTPException(status_code=404, detail="Produto não encontrado no Mongo.")

    insurance_value = body.insurance_value
    if insurance_value is None:
        insurance_value = float(prod.get("price", 0)) * int(body.quantity)

    payload: Dict[str, Any] = {
        "service": int(body.service_id),
        "from": from_obj,
        "to": {
            "name": body.receiver_name,
            "phone": body.receiver_phone,
            "email": body.receiver_email,
            "document": receiver_document,
            "address": body.receiver_address,
            "number": body.receiver_number,
            "complement": body.receiver_complement,
            "district": body.receiver_district,
            "city": body.receiver_city,
            "state_abbr": body.receiver_state,
            "postal_code": to_cep,
        },
        "products": [
            {
                "name": prod["name"],
                "quantity": int(body.quantity),
                "unitary_value": float(prod.get("price", 0)),
                "weight": float(prod["weight_kg"]),
                "width": float(prod["width_cm"]),
                "height": float(prod["height_cm"]),
                "length": float(prod["length_cm"]),
            }
        ],
        "options": {
            "insurance_value": float(insurance_value),
            "receipt": False,
            "own_hand": False,
            "collect": False,
        },
    }

    token_doc = await me.get_current_token_doc()
    url = f"{config.ME_BASE}/api/v2/me/cart"
    r = await me.http_post(url, payload, token_doc)

    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    raw = r.json()

    await db.melhorenvio_shipments.insert_one(
        {
            "created_at": datetime.now(timezone.utc).isoformat(),
            "request": payload,
            "response": raw,
            "sandbox": config.MELHOR_ENVIO_SANDBOX,
        }
    )
    return CreateShipmentResponse(raw=raw)

@router.get("/shipping/cart", response_model=CartResponse)
async def shipping_cart_list():
    me.require_me_config()
    token_doc = await me.get_current_token_doc()

    url = f"{config.ME_BASE}/api/v2/me/cart"
    r = await me.http_get(url, token_doc)
    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    return CartResponse(raw=r.json())

@router.post("/shipping/checkout", response_model=CheckoutResponse)
async def shipping_checkout(body: CheckoutRequest):
    me.require_me_config()
    token_doc = await me.get_current_token_doc()
    db = get_db()

    orders = [str(x).strip() for x in (body.orders or []) if str(x).strip()]

    if not orders:
        cart_url = f"{config.ME_BASE}/api/v2/me/cart"
        cart_resp = await me.http_get(cart_url, token_doc)
        if cart_resp.status_code >= 400:
            raise HTTPException(status_code=cart_resp.status_code, detail=cart_resp.text)
        cart = cart_resp.json() or {}
        data = cart.get("data") or []
        orders = [str(it.get("id")).strip() for it in data if it.get("id")]

    if not orders:
        raise HTTPException(status_code=400, detail="Carrinho vazio: não há orders para checkout.")

    payload = {"orders": orders}
    url = f"{config.ME_BASE}/api/v2/me/shipment/checkout"
    r = await me.http_post(url, payload, token_doc)

    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    raw = r.json()
    await db.melhorenvio_checkouts.insert_one(
        {
            "created_at": datetime.now(timezone.utc).isoformat(),
            "request": payload,
            "response": raw,
            "sandbox": config.MELHOR_ENVIO_SANDBOX,
        }
    )
    return CheckoutResponse(raw=raw)

@router.post("/shipping/generate", response_model=GenerateLabelResponse)
async def shipping_generate(body: GenerateLabelRequest):
    me.require_me_config()
    if not body.orders:
        raise HTTPException(status_code=400, detail="orders não pode ser vazio.")

    orders = [str(x).strip() for x in body.orders if str(x).strip()]
    if not orders:
        raise HTTPException(status_code=400, detail="orders inválido.")

    token_doc = await me.get_current_token_doc()
    db = get_db()

    payload = {"orders": orders}
    url = f"{config.ME_BASE}/api/v2/me/shipment/generate"
    r = await me.http_post(url, payload, token_doc)

    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    raw = r.json()
    await db.melhorenvio_labels.insert_one(
        {
            "created_at": datetime.now(timezone.utc).isoformat(),
            "request": payload,
            "response": raw,
            "sandbox": config.MELHOR_ENVIO_SANDBOX,
        }
    )
    return GenerateLabelResponse(raw=raw)

@router.post("/shipping/print", response_model=PrintResponse)
async def shipping_print(body: PrintRequest):
    me.require_me_config()
    if not body.orders:
        raise HTTPException(status_code=400, detail="orders não pode ser vazio.")

    orders = [str(x).strip() for x in body.orders if str(x).strip()]
    if not orders:
        raise HTTPException(status_code=400, detail="orders inválido.")

    token_doc = await me.get_current_token_doc()
    payload = {"mode": body.mode or "private", "orders": orders}
    url = f"{config.ME_BASE}/api/v2/me/shipment/print"
    r = await me.http_post(url, payload, token_doc)

    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    return PrintResponse(raw=r.json())

@router.get("/shipping/print/pdf/{order_id}")
async def shipping_print_pdf(order_id: str):
    me.require_me_config()
    token_doc = await me.get_current_token_doc()

    url = f"{config.ME_BASE}/api/v2/me/shipment/print/{order_id}"
    r = await me.http_get(url, token_doc)

    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    return r.json()