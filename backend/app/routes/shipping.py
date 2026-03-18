from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from bson import ObjectId
from bson.errors import InvalidId

from app.core import config
from app.db.mongo import get_db

from app.services import melhor_envio as me
from app.services.shipping_service import (
    checkout_shipping,
    generate_label_shipping,
    get_label_shipping,
)

from app.schemas.shipping import (
    QuoteRequest,
    CreateShipmentRequest,
    CreateShipmentResponse,
)

router = APIRouter(prefix="/api")

# =====================================================
# FUNÇÃO SEGURA PARA BUSCAR PRODUTO (CORRIGIDA)
# =====================================================
async def find_product(db, product_id: str):

    print("🔍 ID recebido:", product_id)

    prod = None

    # tenta buscar como ObjectId
    try:
        obj_id = ObjectId(product_id)
        prod = await db.products.find_one({"_id": obj_id})
        print("Busca por ObjectId:", prod)
    except InvalidId:
        print("ID não é ObjectId válido")

    # fallback (caso tenha salvo como string)
    if not prod:
        prod = await db.products.find_one({"id": product_id})
        print("Busca por campo id:", prod)

    # fallback final
    if not prod:
        prod = await db.products.find_one({"_id": product_id})
        print("Busca por _id string:", prod)

    return prod


# =================================
# CALCULAR FRETE
# =================================
@router.post("/shipping/quote")
async def shipping_quote(body: QuoteRequest):

    me.require_me_config()

    to_cep = me.sanitize_cep(body.to_cep)

    if len(to_cep) != 8:
        raise HTTPException(status_code=400, detail="CEP inválido.")

    if body.quantity < 1:
        raise HTTPException(status_code=400, detail="quantity inválido.")

    db = get_db()

    products = await db.products.find().to_list(5)
    print("📦 PRODUTOS NO BANCO:", products)

    # ---------------------------
    # BUSCAR PRODUTO
    # ---------------------------
    prod = await find_product(db, body.product_id)

    if not prod:
        raise HTTPException(
            status_code=404,
            detail=f"Produto não encontrado no Mongo: {body.product_id}"
        )

    print("✅ Produto encontrado:", prod.get("name"))

    # ---------------------------
    # PEGAR VARIAÇÃO
    # ---------------------------
    if not prod.get("variations"):
        raise HTTPException(status_code=400, detail="Produto sem variações.")

    variation = prod["variations"][0]

    from_cep = me.sanitize_cep(config.MELHOR_ENVIO_FROM_CEP)

    insurance_value = body.insurance_value

    if insurance_value is None:
        insurance_value = float(variation.get("price", 0)) * int(body.quantity)

    payload: Dict[str, Any] = {
        "from": {"postal_code": from_cep},
        "to": {"postal_code": to_cep},
        "products": [
            {
                "id": str(body.product_id),
                "width": float(variation["width_cm"]),
                "height": float(variation["height_cm"]),
                "length": float(variation["length_cm"]),
                "weight": float(variation["weight_kg"]),
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

    data = r.json()

    options = []

    for item in data:
        if "price" in item:
            options.append({
                "id": item.get("id"),
                "name": item.get("name"),
                "price": item.get("price"),
                "delivery_time": item.get("delivery_time"),
                "company": item.get("company", {}).get("name"),
                "service": item.get("service"),
            })

    return {"options": options}


# =================================
# CRIAR ENVIO
# =================================
@router.post("/shipping/create", response_model=CreateShipmentResponse)
async def shipping_create(body: CreateShipmentRequest):

    me.require_me_config()
    me.require_sender_config_for_cart()

    to_cep = me.sanitize_cep(body.to_cep)

    if len(to_cep) != 8:
        raise HTTPException(status_code=400, detail="CEP inválido.")

    if body.quantity < 1:
        raise HTTPException(status_code=400, detail="quantity inválido.")

    receiver_document = me.sanitize_document(body.receiver_document)

    if len(receiver_document) not in (11, 14):
        raise HTTPException(status_code=400, detail="CPF ou CNPJ inválido.")

    from_obj = me.build_sender_from_env()

    db = get_db()

    prod = await find_product(db, body.product_id)

    if not prod:
        raise HTTPException(
            status_code=404,
            detail=f"Produto não encontrado: {body.product_id}"
        )

    variation = prod["variations"][0]

    insurance_value = body.insurance_value

    if insurance_value is None:
        insurance_value = float(variation.get("price", 0)) * int(body.quantity)

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
                "unitary_value": float(variation.get("price", 0)),
                "weight": float(variation["weight_kg"]),
                "width": float(variation["width_cm"]),
                "height": float(variation["height_cm"]),
                "length": float(variation["length_cm"]),
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

    await db.melhorenvio_shipments.insert_one({
        "created_at": datetime.now(timezone.utc).isoformat(),
        "request": payload,
        "response": raw,
        "sandbox": config.MELHOR_ENVIO_SANDBOX,
    })

    return CreateShipmentResponse(raw=raw)


# =================================
# CHECKOUT
# =================================
@router.post("/shipping/checkout/order/{order_id}")
async def shipping_checkout_by_order(order_id: str):
    db = get_db()
    return await checkout_shipping(db, order_id)


# =================================
# GERAR ETIQUETA
# =================================
@router.post("/shipping/generate/order/{order_id}")
async def shipping_generate_by_order(order_id: str):
    db = get_db()
    return await generate_label_shipping(db, order_id)


# =================================
# BAIXAR ETIQUETA
# =================================
@router.get("/shipping/label/order/{order_id}")
async def shipping_label_by_order(order_id: str):
    db = get_db()
    return await get_label_shipping(db, order_id)


