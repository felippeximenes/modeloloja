from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException
from bson import ObjectId
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.db.mongo import get_db
from app.schemas.auth import UserRegister, UserLogin, UserOut, AuthResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_access_token(data: dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def serialize_user(user: dict[str, Any]) -> UserOut:
    return UserOut(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        provider=user.get("provider", "local"),
        created_at=user["created_at"],
    )


async def get_current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token ausente ou inválido.")

    token = authorization.replace("Bearer ", "").strip()

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido.")

    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido.")

    db = get_db()

    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = None

    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado.")

    return user


@router.post("/register", response_model=AuthResponse)
async def register(body: UserRegister):
    db = get_db()

    existing_user = await db.users.find_one({"email": body.email.lower().strip()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Este email já está cadastrado.")

    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "name": body.name.strip(),
        "email": body.email.lower().strip(),
        "password_hash": hash_password(body.password),
        "provider": "local",
        "created_at": now,
        "updated_at": now,
    }

    result = await db.users.insert_one(doc)

    user = await db.users.find_one({"_id": result.inserted_id})
    token = create_access_token({"sub": str(user["_id"])})

    return AuthResponse(
        access_token=token,
        user=serialize_user(user),
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: UserLogin):
    db = get_db()

    user = await db.users.find_one({"email": body.email.lower().strip()})

    if not user:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos.")

    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos.")

    token = create_access_token({"sub": str(user["_id"])})

    return AuthResponse(
        access_token=token,
        user=serialize_user(user),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    return serialize_user(current_user)