from __future__ import annotations

from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, HTTPException

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
        del it["_id"]
        out.append(ProductOut(**it))

    return out


# =========================
# GET PRODUCT BY ID  
# =========================
@router.get("/products/{product_id}", response_model=ProductOut)
async def get_product_by_id(product_id: str):
    db = get_db()

    try:
        _id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product id")

    product = await db.products.find_one({"_id": _id})

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product["id"] = str(product["_id"])
    del product["_id"]

    return ProductOut(**product)

# =========================
# Public Products (para exibição no frontend, sem detalhes sensíveis)
# =========================

@router.get("/public/products")
async def list_public_products():

    db = get_db()

    products = []

    cursor = db.products.find({"active": True})

    async for product in cursor:
        product["_id"] = str(product["_id"])
        products.append(product)

    return products