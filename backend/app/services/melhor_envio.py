from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict
import uuid
import httpx
from fastapi import HTTPException

from app.core import config
from app.db.mongo import get_db

def sanitize_cep(value: str) -> str:
    return "".join([c for c in str(value or "") if c.isdigit()])[:8]

def sanitize_document(value: str) -> str:
    return "".join([c for c in str(value or "") if c.isdigit()])

def normalize_token_type(token_type: str | None) -> str:
    tt = (token_type or "").strip()
    if not tt:
        return "Bearer"
    tt = tt.replace("/", "").strip()
    if tt.lower() == "bearer":
        return "Bearer"
    return tt

def require_env(label: str, value: str):
    if not str(value or "").strip():
        raise HTTPException(status_code=500, detail=f"Missing {label} in backend/.env")

def require_me_config():
    if not config.MELHOR_ENVIO_CLIENT_ID or not config.MELHOR_ENVIO_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Melhor Envio not configured. Set MELHOR_ENVIO_CLIENT_ID and MELHOR_ENVIO_CLIENT_SECRET in backend/.env",
        )
    if not config.MELHOR_ENVIO_PUBLIC_URL:
        raise HTTPException(
            status_code=500,
            detail="Missing MELHOR_ENVIO_PUBLIC_URL in backend/.env (use your ngrok https URL).",
        )

    from_cep = sanitize_cep(config.MELHOR_ENVIO_FROM_CEP)
    if len(from_cep) != 8:
        raise HTTPException(
            status_code=500,
            detail="Missing/invalid MELHOR_ENVIO_FROM_CEP in backend/.env (needs 8 digits).",
        )

    if not config.MELHOR_ENVIO_USER_AGENT.strip():
        raise HTTPException(status_code=500, detail="Missing MELHOR_ENVIO_USER_AGENT in backend/.env")

def require_sender_config_for_cart():
    require_env("MELHOR_ENVIO_FROM_NAME", config.ME_FROM_NAME)
    require_env("MELHOR_ENVIO_FROM_PHONE", config.ME_FROM_PHONE)
    require_env("MELHOR_ENVIO_FROM_ADDRESS", config.ME_FROM_ADDRESS)
    require_env("MELHOR_ENVIO_FROM_NUMBER", config.ME_FROM_NUMBER)
    require_env("MELHOR_ENVIO_FROM_DISTRICT", config.ME_FROM_DISTRICT)
    require_env("MELHOR_ENVIO_FROM_CITY", config.ME_FROM_CITY)
    require_env("MELHOR_ENVIO_FROM_STATE", config.ME_FROM_STATE)

def get_redirect_uri() -> str:
    return f"{config.MELHOR_ENVIO_PUBLIC_URL}{config.ME_CALLBACK_PATH}"

async def save_oauth_state(state: str):
    db = get_db()
    await db.oauth_states.insert_one({"state": state, "created_at": datetime.now(timezone.utc).isoformat()})

async def pop_oauth_state(state: str) -> bool:
    db = get_db()
    doc = await db.oauth_states.find_one_and_delete({"state": state})
    return bool(doc)

async def save_token(token_payload: dict):
    db = get_db()
    now = datetime.now(timezone.utc)

    expires_in = token_payload.get("expires_in")
    expires_at = None
    if isinstance(expires_in, int):
        expires_at = now.timestamp() + expires_in

    doc = {
        "access_token": token_payload.get("access_token"),
        "refresh_token": token_payload.get("refresh_token"),
        "token_type": normalize_token_type(token_payload.get("token_type")),
        "scope": token_payload.get("scope"),
        "expires_in": expires_in,
        "expires_at": expires_at,
        "updated_at": now.isoformat(),
        "sandbox": config.MELHOR_ENVIO_SANDBOX,
    }

    await db.melhorenvio_tokens.update_one({"_id": "current"}, {"$set": doc}, upsert=True)

async def get_current_token_doc() -> dict:
    db = get_db()
    doc = await db.melhorenvio_tokens.find_one({"_id": "current"}, {"_id": 0})
    if not doc or not doc.get("access_token"):
        raise HTTPException(status_code=401, detail="Melhor Envio não conectado (token não encontrado).")
    return doc

def build_auth_header(token_doc: dict) -> str:
    token_type = normalize_token_type(token_doc.get("token_type"))
    access_token = str(token_doc["access_token"]).strip()
    return f"{token_type} {access_token}"

def build_sender_from_env() -> dict:
    from_cep = sanitize_cep(config.MELHOR_ENVIO_FROM_CEP)
    return {
        "name": config.ME_FROM_NAME,
        "phone": config.ME_FROM_PHONE,
        "email": (config.ME_FROM_EMAIL or None),
        "address": config.ME_FROM_ADDRESS,
        "number": config.ME_FROM_NUMBER,
        "complement": (config.ME_FROM_COMPLEMENT or None),
        "district": config.ME_FROM_DISTRICT,
        "city": config.ME_FROM_CITY,
        "state_abbr": config.ME_FROM_STATE,
        "postal_code": from_cep,
    }

def headers_json(token_doc: dict) -> dict:
    return {
        "Authorization": build_auth_header(token_doc),
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": config.MELHOR_ENVIO_USER_AGENT,
    }

def headers_basic(token_doc: dict) -> dict:
    return {
        "Authorization": build_auth_header(token_doc),
        "Accept": "application/json",
        "User-Agent": config.MELHOR_ENVIO_USER_AGENT,
    }

async def http_post(url: str, json: dict, token_doc: dict) -> httpx.Response:
    async with httpx.AsyncClient(timeout=30) as http:
        return await http.post(url, json=json, headers=headers_json(token_doc))

async def http_get(url: str, token_doc: dict) -> httpx.Response:
    async with httpx.AsyncClient(timeout=30) as http:
        return await http.get(url, headers=headers_basic(token_doc))

def new_state() -> str:
    return str(uuid.uuid4())