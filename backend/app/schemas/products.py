from pydantic import BaseModel, Field
from typing import List
from datetime import datetime


class ProductVariation(BaseModel):
    sku: str
    model: str
    color: str
    size: str
    price: float
    weight_kg: float
    width_cm: float
    height_cm: float
    length_cm: float
    stock: int = Field(ge=0)
    active: bool = True


class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    images: List[str]
    variations: List[ProductVariation]
    active: bool = True


class ProductOut(ProductCreate):
    id: str