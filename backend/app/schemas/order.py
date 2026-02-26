from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field, ConfigDict


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = 1


class ShippingSelection(BaseModel):
    # retorno do /shipping/quote que o comprador escolheu
    service_id: int
    company_name: Optional[str] = None
    price: float
    delivery_time: Optional[int] = None


class AddressCreate(BaseModel):
    to_cep: str
    receiver_name: str
    receiver_phone: str
    receiver_document: str  # CPF/CNPJ
    receiver_email: str | None = None
    receiver_address: str
    receiver_number: str
    receiver_complement: str | None = None
    receiver_district: str
    receiver_city: str
    receiver_state: str


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    address: AddressCreate
    shipping: ShippingSelection


class OrderOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    status: str
    items: list[dict]
    address: dict
    shipping: dict
    subtotal: float
    shipping_price: float
    total: float
    created_at: datetime
    updated_at: datetime


class OrderStatusPatch(BaseModel):
    status: str = Field(..., examples=["created", "paid", "shipped", "cancelled"])
    meta: dict[str, Any] | None = None