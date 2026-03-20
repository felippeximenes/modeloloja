from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AddressBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=80)
    receiver_name: str = Field(..., min_length=2, max_length=120)
    receiver_phone: str = Field(..., min_length=8, max_length=30)
    receiver_document: str = Field(..., min_length=11, max_length=20)
    receiver_email: Optional[str] = None

    to_cep: str = Field(..., min_length=8, max_length=9)
    receiver_address: str = Field(..., min_length=2, max_length=160)
    receiver_number: str = Field(..., min_length=1, max_length=20)
    receiver_complement: Optional[str] = None
    receiver_district: str = Field(..., min_length=2, max_length=80)
    receiver_city: str = Field(..., min_length=2, max_length=80)
    receiver_state: str = Field(..., min_length=2, max_length=30)

    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=80)
    receiver_name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    receiver_phone: Optional[str] = Field(default=None, min_length=8, max_length=30)
    receiver_document: Optional[str] = Field(default=None, min_length=11, max_length=20)
    receiver_email: Optional[str] = None

    to_cep: Optional[str] = Field(default=None, min_length=8, max_length=9)
    receiver_address: Optional[str] = Field(default=None, min_length=2, max_length=160)
    receiver_number: Optional[str] = Field(default=None, min_length=1, max_length=20)
    receiver_complement: Optional[str] = None
    receiver_district: Optional[str] = Field(default=None, min_length=2, max_length=80)
    receiver_city: Optional[str] = Field(default=None, min_length=2, max_length=80)
    receiver_state: Optional[str] = Field(default=None, min_length=2, max_length=30)

    is_default: Optional[bool] = None


class AddressOut(AddressBase):
    model_config = ConfigDict(extra="ignore")

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime