from __future__ import annotations

from datetime import datetime, timezone
from fastapi import APIRouter
from bson import ObjectId

from app.db.mongo import get_db
from app.schemas.products import ProductCreate, ProductOut

router = APIRouter(prefix="/api")

@router.post("/products", response_model=ProductOut)
async def create_product(payload: ProductCreate):
    db = get_db()
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.products.insert_one(doc)
    return ProductOut(id=str(res.inserted_id), **payload.model_dump())

@router.get("/products", response_model=list[ProductOut])
async def list_products(limit: int = 50):
    db = get_db()
    items = await db.products.find({}).limit(limit).to_list(limit)

    out: list[ProductOut] = []
    for it in items:
        out.append(
            ProductOut(
                id=str(it["_id"]),
                name=it["name"],
                price=float(it["price"]),
                weight_kg=float(it["weight_kg"]),
                width_cm=float(it["width_cm"]),
                height_cm=float(it["height_cm"]),
                length_cm=float(it["length_cm"]),
                sku=it.get("sku"),
                image=it.get("image"),
            )
        )
    return out