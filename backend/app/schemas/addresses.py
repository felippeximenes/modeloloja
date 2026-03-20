from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.db.mongo import get_db
from app.routes.auth import get_current_user
from app.schemas.address import AddressCreate, AddressOut, AddressUpdate


router = APIRouter(
    prefix="/api/addresses",
    tags=["addresses"],
)


def utcnow():
    return datetime.now(timezone.utc)


def serialize_address(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": doc["user_id"],
        "title": doc["title"],
        "receiver_name": doc["receiver_name"],
        "receiver_phone": doc["receiver_phone"],
        "receiver_document": doc["receiver_document"],
        "receiver_email": doc.get("receiver_email"),
        "to_cep": doc["to_cep"],
        "receiver_address": doc["receiver_address"],
        "receiver_number": doc["receiver_number"],
        "receiver_complement": doc.get("receiver_complement"),
        "receiver_district": doc["receiver_district"],
        "receiver_city": doc["receiver_city"],
        "receiver_state": doc["receiver_state"],
        "is_default": bool(doc.get("is_default", False)),
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
    }


@router.get("", response_model=list[AddressOut])
async def list_my_addresses(current_user=Depends(get_current_user)):
    db = get_db()

    cursor = db.addresses.find(
        {"user_id": str(current_user["_id"])}
    ).sort("is_default", -1).sort("created_at", -1)

    items = []
    async for doc in cursor:
        items.append(serialize_address(doc))

    return items


@router.post("", response_model=AddressOut)
async def create_address(body: AddressCreate, current_user=Depends(get_current_user)):
    db = get_db()
    now = utcnow()

    payload = body.model_dump()
    payload["user_id"] = str(current_user["_id"])
    payload["created_at"] = now
    payload["updated_at"] = now

    payload["to_cep"] = "".join(filter(str.isdigit, payload["to_cep"]))

    if payload.get("is_default"):
        await db.addresses.update_many(
            {"user_id": str(current_user["_id"])},
            {"$set": {"is_default": False, "updated_at": now}},
        )

    result = await db.addresses.insert_one(payload)
    doc = await db.addresses.find_one({"_id": result.inserted_id})

    return serialize_address(doc)


@router.put("/{address_id}", response_model=AddressOut)
async def update_address(address_id: str, body: AddressUpdate, current_user=Depends(get_current_user)):
    db = get_db()

    try:
        _id = ObjectId(address_id)
    except Exception:
        raise HTTPException(status_code=400, detail="address_id inválido.")

    current = await db.addresses.find_one({
        "_id": _id,
        "user_id": str(current_user["_id"]),
    })

    if not current:
        raise HTTPException(status_code=404, detail="Endereço não encontrado.")

    update_data = {
        k: v for k, v in body.model_dump(exclude_unset=True).items()
    }

    if "to_cep" in update_data and update_data["to_cep"]:
        update_data["to_cep"] = "".join(filter(str.isdigit, update_data["to_cep"]))

    update_data["updated_at"] = utcnow()

    if update_data.get("is_default") is True:
        await db.addresses.update_many(
            {"user_id": str(current_user["_id"])},
            {"$set": {"is_default": False, "updated_at": utcnow()}},
        )

    await db.addresses.update_one(
        {"_id": _id, "user_id": str(current_user["_id"])},
        {"$set": update_data},
    )

    doc = await db.addresses.find_one({"_id": _id})
    return serialize_address(doc)


@router.delete("/{address_id}")
async def delete_address(address_id: str, current_user=Depends(get_current_user)):
    db = get_db()

    try:
        _id = ObjectId(address_id)
    except Exception:
        raise HTTPException(status_code=400, detail="address_id inválido.")

    result = await db.addresses.delete_one({
        "_id": _id,
        "user_id": str(current_user["_id"]),
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Endereço não encontrado.")

    return {"ok": True, "message": "Endereço removido com sucesso."}