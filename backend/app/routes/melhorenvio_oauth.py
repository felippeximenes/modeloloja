from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from urllib.parse import urlencode
import httpx

from app.core import config
from app.services import melhorenvio as me
from app.db.mongo import get_db

router = APIRouter(prefix="/api")

@router.get("/melhorenvio/auth")
async def melhorenvio_auth():
    me.require_me_config()

    state = me.new_state()
    await me.save_oauth_state(state)

    params = {
        "client_id": config.MELHOR_ENVIO_CLIENT_ID,
        "redirect_uri": me.get_redirect_uri(),
        "response_type": "code",
        "state": state,
    }
    if config.MELHOR_ENVIO_OAUTH_SCOPE:
        params["scope"] = config.MELHOR_ENVIO_OAUTH_SCOPE

    url = f"{config.ME_AUTHORIZE_URL}?{urlencode(params)}"
    return RedirectResponse(url=url, status_code=302)

@router.get("/melhorenvio/callback")
async def melhorenvio_callback(request: Request, code: str | None = None, state: str | None = None):
    me.require_me_config()

    if not code:
        raise HTTPException(status_code=400, detail="Missing 'code' in callback.")
    if not state:
        raise HTTPException(status_code=400, detail="Missing 'state' in callback.")

    ok = await me.pop_oauth_state(state)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid/expired state.")

    data = {
        "grant_type": "authorization_code",
        "client_id": config.MELHOR_ENVIO_CLIENT_ID,
        "client_secret": config.MELHOR_ENVIO_CLIENT_SECRET,
        "redirect_uri": me.get_redirect_uri(),
        "code": code,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(config.ME_TOKEN_URL, data=data)
            if resp.status_code >= 400:
                return JSONResponse(
                    status_code=resp.status_code,
                    content={"error": "token_exchange_failed", "details": resp.text},
                )
            payload = resp.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Error calling Melhor Envio token endpoint: {str(e)}")

    await me.save_token(payload)

    return {
        "ok": True,
        "message": "Token salvo com sucesso no MongoDB.",
        "redirect_uri_used": me.get_redirect_uri(),
        "sandbox": config.MELHOR_ENVIO_SANDBOX,
        "scope_from_token": payload.get("scope"),
        "token_type_from_token": payload.get("token_type"),
    }

@router.get("/melhorenvio/token")
async def melhorenvio_token_status():
    db = get_db()
    doc = await db.melhorenvio_tokens.find_one({"_id": "current"}, {"_id": 0})
    if not doc:
        return {"connected": False}

    access_token = str(doc.get("access_token") or "")
    return {
        "connected": True,
        "sandbox": bool(doc.get("sandbox")),
        "updated_at": doc.get("updated_at"),
        "expires_at": doc.get("expires_at"),
        "has_refresh_token": bool(doc.get("refresh_token")),
        "token_type": doc.get("token_type"),
        "scope": doc.get("scope"),
        "has_access_token": bool(access_token.strip()),
        "access_token_len": len(access_token.strip()),
    }