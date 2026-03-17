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

    # adicionar os dois ids
    doc["_id"] = str(res.inserted_id)
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

        mongo_id = str(it["_id"])

        it["_id"] = mongo_id
        it["id"] = mongo_id

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

    mongo_id = str(product["_id"])

    product["_id"] = mongo_id
    product["id"] = mongo_id

    return ProductOut(**product)


# =========================
# PUBLIC PRODUCTS
# =========================
@router.get("/public/products")
async def list_public_products():

    db = get_db()

    products = []

    cursor = db.products.find({"active": True})

    async for product in cursor:

        mongo_id = str(product["_id"])

        product["_id"] = mongo_id
        product["id"] = mongo_id

        products.append(product)

    return products