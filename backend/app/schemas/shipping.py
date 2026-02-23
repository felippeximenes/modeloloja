from __future__ import annotations
from typing import Any
from pydantic import BaseModel

class QuoteRequest(BaseModel):
    to_cep: str
    product_id: str
    quantity: int = 1
    insurance_value: float | None = None

class QuoteResponse(BaseModel):
    raw: Any

class CreateShipmentRequest(BaseModel):
    to_cep: str
    product_id: str
    quantity: int = 1
    service_id: int

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

    insurance_value: float | None = None

class CreateShipmentResponse(BaseModel):
    raw: Any

class CartResponse(BaseModel):
    raw: Any

class CheckoutRequest(BaseModel):
    orders: list[str] = []

class CheckoutResponse(BaseModel):
    raw: Any

class GenerateLabelRequest(BaseModel):
    orders: list[str]

class GenerateLabelResponse(BaseModel):
    raw: Any

class PrintRequest(BaseModel):
    mode: str = "private"
    orders: list[str]

class PrintResponse(BaseModel):
    raw: Any