from __future__ import annotations

from datetime import datetime, timezone
from fastapi import APIRouter

from app.db.mongo import get_db
from app.schemas.products import ProductCreate, ProductOut

router = APIRouter(prefix="/api")


# =========================
# CREATE PRODUCT
# =========================
@router.post("/products", response_model=ProductOut)
async def create_product(payload: ProductCreate):
    db = get_db()

    doc = payload.model_dump()
    now = datetime.now(timezone.utc).isoformat()

    doc["created_at"] = now
    doc["updated_at"] = now

    res = await db.products.insert_one(doc)

    doc["id"] = str(res.inserted_id)
    return ProductOut(**doc)


# =========================
# LIST PRODUCTS
# =========================
@router.get("/products", response_model=list[ProductOut])
async def list_products(limit: int = 50):
    db = get_db()

    items = await db.products.find({}).limit(limit).to_list(limit)

    out: list[ProductOut] = []

    for it in items:
        it["id"] = str(it["_id"])
        out.append(ProductOut(**it))

    return out