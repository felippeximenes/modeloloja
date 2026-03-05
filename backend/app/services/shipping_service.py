from fastapi import HTTPException
from bson import ObjectId

from app.services import melhor_envio as me
from app.core import config


# =================================
# CHECKOUT DO CARRINHO
# =================================

async def checkout_shipping(db, order_id: str):

    try:
        _id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="order_id inválido")

    order = await db.orders.find_one({"_id": _id})

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    cart_ids = order["melhor_envio"]["cart_order_ids"]

    if not cart_ids:
        raise HTTPException(status_code=400, detail="Carrinho do Melhor Envio vazio")

    token_doc = await me.get_current_token_doc()

    payload = {
        "orders": cart_ids
    }

    url = f"{config.ME_BASE}/api/v2/me/shipment/checkout"

    r = await me.http_post(url, payload, token_doc)

    if r.status_code >= 400:
        print("❌ MELHOR ENVIO CHECKOUT ERROR")
        print(r.text)
        raise HTTPException(status_code=r.status_code, detail=r.text)

    response = r.json()

    await db.orders.update_one(
        {"_id": _id},
        {
            "$set": {
                "melhor_envio.checkout": response,
            }
        },
    )

    return response

# =================================
# GERAR ETIQUETA PELO ORDER_ID
# =================================

async def generate_label_shipping(db, order_id: str):

    try:
        _id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="order_id inválido")

    order = await db.orders.find_one({"_id": _id})

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    cart_ids = order.get("melhor_envio", {}).get("cart_order_ids", [])

    if not cart_ids:
        raise HTTPException(status_code=400, detail="Carrinho do Melhor Envio vazio")

    token_doc = await me.get_current_token_doc()

    payload = {
        "orders": cart_ids
    }

    url = f"{config.ME_BASE}/api/v2/me/shipment/generate"

    r = await me.http_post(url, payload, token_doc)

    if r.status_code >= 400:
        print("❌ MELHOR ENVIO GENERATE ERROR")
        print(r.text)
        raise HTTPException(status_code=r.status_code, detail=r.text)

    response = r.json()

    # tenta extrair tracking automaticamente
    tracking_code = None

    try:
        data = response.get("data", [])

        if data:
            tracking_code = data[0].get("tracking")
    except Exception:
        pass

    await db.orders.update_one(
        {"_id": _id},
        {
            "$set": {
                "melhor_envio.label": response,
                "melhor_envio.tracking_code": tracking_code,
            }
        },
    )

    return response

# =================================
# BAIXAR ETIQUETA DA ORDER
# =================================

from fastapi.responses import Response


async def get_label_shipping(db, order_id: str):

    try:
        _id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="order_id inválido")

    order = await db.orders.find_one({"_id": _id})

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    cart_ids = order.get("melhor_envio", {}).get("cart_order_ids", [])

    if not cart_ids:
        raise HTTPException(status_code=400, detail="Carrinho do Melhor Envio vazio")

    token_doc = await me.get_current_token_doc()

    order_id_me = cart_ids[0]

    url = f"{config.ME_BASE}/api/v2/me/shipment/print/{order_id_me}"

    r = await me.http_get(url, token_doc)

    if r.status_code >= 400:
        print("❌ MELHOR ENVIO PRINT ERROR")
        print(r.text)
        raise HTTPException(status_code=r.status_code, detail=r.text)

    return Response(
        content=r.content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=etiqueta_{order_id}.pdf"
        },
    )