from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.db.mongo import get_db
from app.schemas.order import OrderCreate, OrderOut, OrderStatusPatch
from app.services.order_service import (
    create_order,
    get_order,
    update_order_status,
    to_order_out,
)

router = APIRouter(
    prefix="/api/orders",
    tags=["orders"],
)


# =========================
# CREATE ORDER
# =========================
@router.post("", response_model=OrderOut)
async def create_order_route(body: OrderCreate):
    db = get_db()

    doc = await create_order(db, body.model_dump())

    if not doc:
        raise HTTPException(status_code=400, detail="Failed to create order")

    return to_order_out(doc)


# =========================
# GET ORDER
# =========================
@router.get("/{order_id}", response_model=OrderOut)
async def get_order_route(order_id: str):
    db = get_db()

    doc = await get_order(db, order_id)

    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")

    return to_order_out(doc)


# =========================
# UPDATE ORDER STATUS
# =========================
@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status_route(order_id: str, body: OrderStatusPatch):
    db = get_db()

    doc = await update_order_status(
        db,
        order_id,
        body.status,
        body.meta,
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")

    return to_order_out(doc)