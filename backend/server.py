from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

# ---------------------------
# Env loading
# ---------------------------
ROOT_DIR = Path(__file__).parent

# Load .env if it exists (safe)
env_file = ROOT_DIR / ".env"
if env_file.exists():
    load_dotenv(env_file)
else:
    # fallback: still allow environment variables to be provided by the OS/shell
    load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "moldz3d")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

# ---------------------------
# App
# ---------------------------
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ---------------------------
# Logging
# ---------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("backend")

# ---------------------------
# Mongo client (lazy init)
# ---------------------------
client: Optional[AsyncIOMotorClient] = None
db = None


def ensure_db():
    """
    Ensure Mongo client/db exists. Raises HTTPException if MONGO_URL isn't configured.
    """
    global client, db

    if not MONGO_URL:
        raise HTTPException(
            status_code=500,
            detail="MONGO_URL is not set. Create backend/.env (see .env.example) or set it in your environment.",
        )

    if client is None:
        logger.info("Initializing Mongo client...")
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]

    return db


# ---------------------------
# Models
# ---------------------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # ignore MongoDB "_id" field if present

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


# ---------------------------
# Routes
# ---------------------------
@api_router.get("/")
async def root():
    return {
        "message": "Hello World",
        "db_configured": bool(MONGO_URL),
        "db_name": DB_NAME,
    }


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    database = ensure_db()

    status_obj = StatusCheck(client_name=input.client_name)

    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()

    await database.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    database = ensure_db()

    status_checks = await database.status_checks.find({}, {"_id": 0}).to_list(1000)

    for check in status_checks:
        if isinstance(check.get("timestamp"), str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])

    return status_checks


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS.split(",")] if CORS_ORIGINS else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    global client
    if client is not None:
        client.close()
        client = None
        logger.info("Mongo client closed.")
