from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional


class ProductVariation(BaseModel):
    model_config = ConfigDict(extra="ignore")

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
    image: Optional[str] = None


class ProductCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    description: str
    categories: List[str] = []
    images: List[str] = []
    variations: List[ProductVariation]
    active: bool = True


class ProductOut(ProductCreate):
    id: str