from __future__ import annotations

from fastapi import APIRouter
from app.db.mongo import get_db
from app.schemas.order import OrderCreate, OrderOut
from app.services.order_service import create_order, get_order, to_order_out

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut)
async def create_order_route(body: OrderCreate):
    db = get_db()
    doc = await create_order(db, body.model_dump())
    return to_order_out(doc)


@router.get("/{order_id}", response_model=OrderOut)
async def get_order_route(order_id: str):
    db = get_db()
    doc = await get_order(db, order_id)
    return to_order_out(doc)