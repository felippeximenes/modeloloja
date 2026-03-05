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