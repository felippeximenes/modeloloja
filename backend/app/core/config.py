from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[2]  # backend/
env_file = ROOT_DIR / ".env"

if env_file.exists():
    load_dotenv(env_file)
else:
    load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "moldz3d")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

MELHOR_ENVIO_SANDBOX = os.getenv("MELHOR_ENVIO_SANDBOX", "true").lower() in ("1", "true", "yes", "y")
MELHOR_ENVIO_CLIENT_ID = os.getenv("MELHOR_ENVIO_CLIENT_ID")
MELHOR_ENVIO_CLIENT_SECRET = os.getenv("MELHOR_ENVIO_CLIENT_SECRET")
MELHOR_ENVIO_PUBLIC_URL = (os.getenv("MELHOR_ENVIO_PUBLIC_URL") or "").rstrip("/")
MELHOR_ENVIO_FROM_CEP = os.getenv("MELHOR_ENVIO_FROM_CEP", "")
MELHOR_ENVIO_USER_AGENT = os.getenv("MELHOR_ENVIO_USER_AGENT", "Moldz3D (contato@exemplo.com)")
MELHOR_ENVIO_OAUTH_SCOPE = (os.getenv("MELHOR_ENVIO_OAUTH_SCOPE") or "").strip()

ME_FROM_NAME = os.getenv("MELHOR_ENVIO_FROM_NAME", "")
ME_FROM_PHONE = os.getenv("MELHOR_ENVIO_FROM_PHONE", "")
ME_FROM_EMAIL = os.getenv("MELHOR_ENVIO_FROM_EMAIL", "")
ME_FROM_ADDRESS = os.getenv("MELHOR_ENVIO_FROM_ADDRESS", "")
ME_FROM_NUMBER = os.getenv("MELHOR_ENVIO_FROM_NUMBER", "")
ME_FROM_COMPLEMENT = os.getenv("MELHOR_ENVIO_FROM_COMPLEMENT", "")
ME_FROM_DISTRICT = os.getenv("MELHOR_ENVIO_FROM_DISTRICT", "")
ME_FROM_CITY = os.getenv("MELHOR_ENVIO_FROM_CITY", "")
ME_FROM_STATE = os.getenv("MELHOR_ENVIO_FROM_STATE", "")

ME_BASE = "https://sandbox.melhorenvio.com.br" if MELHOR_ENVIO_SANDBOX else "https://melhorenvio.com.br"
ME_AUTHORIZE_URL = f"{ME_BASE}/oauth/authorize"
ME_TOKEN_URL = f"{ME_BASE}/oauth/token"
ME_CALLBACK_PATH = "/api/melhorenvio/callback"