from __future__ import annotations

from datetime import datetime
from typing import Any, Optional, List
from enum import Enum

from pydantic import BaseModel, ConfigDict

# =========================
# ENUMS
# =========================

class OrderStatus(str, Enum):
    created = "created"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentStatus(str, Enum):
    unpaid = "unpaid"
    paid = "paid"
    failed = "failed"


# =========================
# ORDER ITEMS
# =========================

class OrderItemCreate(BaseModel):
    product_id: str
    sku: str
    quantity: int = 1
    # ❌ NÃO receber preço do frontend
    # preço é calculado no backend para evitar fraude


# =========================
# SHIPPING
# =========================

class ShippingSelection(BaseModel):
    service_id: int
    company_name: Optional[str] = None
    price: float
    delivery_time: Optional[int] = None


# =========================
# ADDRESS
# =========================

class AddressCreate(BaseModel):
    to_cep: str
    receiver_name: str
    receiver_phone: str
    receiver_document: str
    receiver_email: Optional[str] = None

    receiver_address: str
    receiver_number: str
    receiver_complement: Optional[str] = None
    receiver_district: str
    receiver_city: str
    receiver_state: str


# =========================
# CREATE ORDER
# =========================

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    address: AddressCreate
    shipping: ShippingSelection


# =========================
# ORDER OUTPUT
# =========================

class OrderOut(BaseModel):

    model_config = ConfigDict(extra="ignore")

    id: str

    status: OrderStatus
    payment_status: PaymentStatus

    items: List[dict]
    address: dict
    shipping: dict

    subtotal: float
    shipping_price: float
    total: float

    payment_id: Optional[str] = None
    payment_provider: Optional[str] = None

    created_at: datetime
    updated_at: datetime


# =========================
# PATCH STATUS
# =========================

class OrderStatusPatch(BaseModel):
    status: OrderStatus
    meta: Optional[dict[str, Any]] = None