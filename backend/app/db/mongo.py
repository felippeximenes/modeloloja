from __future__ import annotations

import logging

from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import HTTPException

from app.core.config import MONGO_URL, DB_NAME

logger = logging.getLogger("backend")

_client: AsyncIOMotorClient | None = None
_db = None


def get_db():
    global _client, _db

    if not MONGO_URL:
        raise HTTPException(
            status_code=500,
            detail="MONGO_URL is not set. Create backend/.env (see .env.example) or set it in your environment.",
        )

    if _client is None:
        logger.info("Initializing Mongo client...")
        _client = AsyncIOMotorClient(MONGO_URL)
        _db = _client[DB_NAME]

    return _db


def close_db():
    global _client
    if _client is not None:
        _client.close()
        _client = None
        logger.info("Mongo client closed.")