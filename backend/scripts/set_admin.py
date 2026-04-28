"""
Concede ou revoga privilégio de administrador para um usuário.

Uso:
    python backend/scripts/set_admin.py felippelorran@gmail.com
    python backend/scripts/set_admin.py felippelorran@gmail.com --revoke
"""

import sys
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).parent.parent / ".env")

from pymongo import MongoClient

email = sys.argv[1] if len(sys.argv) > 1 else None
revoke = "--revoke" in sys.argv

if not email:
    sys.exit("Uso: python set_admin.py <email> [--revoke]")

client = MongoClient(os.getenv("MONGO_URL"))
col = client["moldz3d"]["users"]

result = col.update_one(
    {"email": email.lower()},
    {"$set": {"is_admin": not revoke}},
)

if result.matched_count == 0:
    print(f"❌  Usuário não encontrado: {email}")
else:
    action = "Revogado" if revoke else "Concedido"
    print(f"✅  {action} acesso admin para: {email}")

client.close()
