from fastapi import APIRouter, Request, HTTPException
from app.db.mongo import get_db

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


@router.post("/melhorenvio")
async def melhorenvio_webhook(request: Request):

    payload = await request.json()

    event = payload.get("event")
    data = payload.get("data", {})

    order_id_me = str(data.get("id"))

    db = get_db()

    order = await db.orders.find_one(
        {"melhor_envio.cart_order_ids": order_id_me}
    )

    if not order:
        return {"message": "order not found"}

    update = {}

    if event == "order.posted":
        update["status"] = "shipped"

    if event == "order.delivered":
        update["status"] = "delivered"

    if update:
        await db.orders.update_one(
            {"_id": order["_id"]},
            {"$set": update},
        )

    return {"received": True}