from __future__ import annotations

import cloudinary
import cloudinary.uploader
from bson import ObjectId
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from typing import List, Optional

from app.core.config import (
    CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
)
from app.db.mongo import get_db
from app.routes.auth import get_current_user

# ── Cloudinary config ─────────────────────────────────────────
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ── Admin guard ───────────────────────────────────────────────

async def get_admin_user(current_user=Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Acesso restrito a administradores.")
    return current_user


# ── Schemas ───────────────────────────────────────────────────

class VariationPayload(BaseModel):
    sku: str
    model: str
    color: str
    size: str
    price: float
    weight_kg: float
    width_cm: float
    height_cm: float
    length_cm: float
    stock: int
    active: bool = True
    image: Optional[str] = None


class ProductPayload(BaseModel):
    name: str
    description: str
    categories: List[str] = []
    images: List[str] = []
    variations: List[VariationPayload]
    active: bool = True


class ProductPatch(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    categories: Optional[List[str]] = None
    images: Optional[List[str]] = None
    variations: Optional[List[VariationPayload]] = None
    active: Optional[bool] = None


# ── Helper ────────────────────────────────────────────────────

def _fmt(p: dict) -> dict:
    p["id"] = str(p.pop("_id"))
    return p


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Image upload ──────────────────────────────────────────────

@router.post("/images/upload")
async def upload_image(
    file: UploadFile = File(...),
    _admin=Depends(get_admin_user),
):
    if not CLOUDINARY_CLOUD_NAME:
        raise HTTPException(status_code=503, detail="Cloudinary não configurado.")

    contents = await file.read()
    result = cloudinary.uploader.upload(
        contents,
        folder="moldz3d/products",
        resource_type="image",
    )
    return {"url": result["secure_url"], "public_id": result["public_id"]}


@router.delete("/images/{public_id:path}")
async def delete_image(public_id: str, _admin=Depends(get_admin_user)):
    cloudinary.uploader.destroy(public_id)
    return {"deleted": True}


# ── Products CRUD ─────────────────────────────────────────────

@router.get("/products")
async def list_products(_admin=Depends(get_admin_user)):
    db = get_db()
    products = []
    async for p in db.products.find({}).sort("_id", -1):
        products.append(_fmt(p))
    return products


@router.get("/products/{product_id}")
async def get_product(product_id: str, _admin=Depends(get_admin_user)):
    db = get_db()
    p = await db.products.find_one({"_id": ObjectId(product_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    return _fmt(p)


@router.post("/products", status_code=201)
async def create_product(payload: ProductPayload, _admin=Depends(get_admin_user)):
    db = get_db()
    now = _now()
    doc = payload.model_dump()
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await db.products.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc


@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    payload: ProductPayload,
    _admin=Depends(get_admin_user),
):
    db = get_db()
    data = payload.model_dump()
    data["updated_at"] = _now()
    result = await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": data},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    return {"updated": True}


@router.patch("/products/{product_id}")
async def patch_product(
    product_id: str,
    payload: ProductPatch,
    _admin=Depends(get_admin_user),
):
    db = get_db()
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    data["updated_at"] = _now()
    result = await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": data},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    return {"updated": True}


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, _admin=Depends(get_admin_user)):
    db = get_db()
    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    return {"deleted": True}


# ── Stats ─────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats(_admin=Depends(get_admin_user)):
    db = get_db()
    total     = await db.products.count_documents({})
    active    = await db.products.count_documents({"active": True})
    inactive  = await db.products.count_documents({"active": False})
    users     = await db.users.count_documents({})
    orders    = await db.orders.count_documents({})
    return {
        "products": {"total": total, "active": active, "inactive": inactive},
        "users": users,
        "orders": orders,
    }
