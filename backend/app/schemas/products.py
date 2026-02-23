from __future__ import annotations
from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str
    price: float
    weight_kg: float
    width_cm: float
    height_cm: float
    length_cm: float
    sku: str | None = None
    image: str | None = None

class ProductOut(ProductCreate):
    id: str