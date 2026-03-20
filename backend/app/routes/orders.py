from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends

from app.db.mongo import get_db
from app.schemas.order import OrderCreate, OrderOut, OrderStatusPatch
from app.services.order_service import (
    create_order,
    get_order,
    update_order_status,
    to_order_out,
    list_orders,
    get_order_label,
    get_order_tracking,
    list_orders_by_user,
)
from app.routes.auth import get_current_user

router = APIRouter(
    prefix="/api/orders",
    tags=["orders"],
)

# =========================
# LIST ORDERS (ADMIN)
# =========================
@router.get("")
async def list_orders_route(status: str | None = None):
    db = get_db()

    try:
        orders = await list_orders(db, status)
        return orders

    except Exception as e:
        print("❌ LIST ORDERS ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Internal server error while listing orders"
        )

# =========================
# LIST MY ORDERS
# =========================
@router.get("/me")
async def list_my_orders_route(current_user=Depends(get_current_user)):
    db = get_db()

    try:
        return await list_orders_by_user(db, str(current_user["_id"]))

    except Exception as e:
        print("❌ LIST MY ORDERS ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Internal server error while listing user orders"
        )

# =========================
# CREATE ORDER
# =========================
@router.post("", response_model=OrderOut)
async def create_order_route(body: OrderCreate, current_user=Depends(get_current_user)):
    db = get_db()

    try:
        payload = body.model_dump()
        payload["user_id"] = str(current_user["_id"])

        doc = await create_order(db, payload)

        if not doc:
            raise HTTPException(
                status_code=400,
                detail="Failed to create order"
            )

        return to_order_out(doc)

    except HTTPException:
        raise

    except Exception as e:
        print("❌ CREATE ORDER ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Internal server error while creating order"
        )

# =========================
# GET MY ORDER
# =========================
@router.get("/{order_id}", response_model=OrderOut)
async def get_order_route(order_id: str, current_user=Depends(get_current_user)):
    db = get_db()

    try:
        doc = await get_order(db, order_id)

        if not doc:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        if doc.get("user_id") != str(current_user["_id"]):
            raise HTTPException(
                status_code=403,
                detail="Você não tem permissão para acessar este pedido"
            )

        return to_order_out(doc)

    except HTTPException:
        raise

    except Exception as e:
        print("❌ GET ORDER ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Internal server error while fetching order"
        )

# =========================
# UPDATE ORDER STATUS
# =========================
@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status_route(order_id: str, body: OrderStatusPatch):
    db = get_db()

    try:
        doc = await update_order_status(
            db,
            order_id,
            body.status,
            body.meta,
        )

        if not doc:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        return to_order_out(doc)

    except HTTPException:
        raise

    except Exception as e:
        print("❌ UPDATE STATUS ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Internal server error while updating order"
        )

# =========================
# GET MY ORDER LABEL
# =========================
@router.get("/{order_id}/label")
async def get_order_label_route(order_id: str, current_user=Depends(get_current_user)):
    db = get_db()

    try:
        order = await get_order(db, order_id)

        if order.get("user_id") != str(current_user["_id"]):
            raise HTTPException(
                status_code=403,
                detail="Você não tem permissão para acessar este pedido"
            )

        return await get_order_label(db, order_id)

    except HTTPException:
        raise

    except Exception as e:
        print("❌ GET LABEL ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Erro ao buscar etiqueta"
        )

# =========================
# GET MY ORDER TRACKING
# =========================
@router.get("/{order_id}/tracking")
async def get_order_tracking_route(order_id: str, current_user=Depends(get_current_user)):
    db = get_db()

    try:
        order = await get_order(db, order_id)

        if order.get("user_id") != str(current_user["_id"]):
            raise HTTPException(
                status_code=403,
                detail="Você não tem permissão para acessar este pedido"
            )

        return await get_order_tracking(db, order_id)

    except HTTPException:
        raise

    except Exception as e:
        print("❌ TRACKING ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Erro ao buscar tracking"
        )