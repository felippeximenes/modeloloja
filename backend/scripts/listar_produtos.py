"""
Lista todos os produtos cadastrados no MongoDB com seus nomes exatos.
Útil para identificar os nomes corretos antes de usar atualizar_produtos.py

Como usar:
    python backend/scripts/listar_produtos.py
"""

import sys
import os
from pathlib import Path

try:
    from pymongo import MongoClient
except ImportError:
    sys.exit("❌  pymongo não encontrado. Rode: pip install pymongo")

try:
    from dotenv import load_dotenv
except ImportError:
    sys.exit("❌  python-dotenv não encontrado. Rode: pip install python-dotenv")

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    sys.exit(f"❌  MONGO_URL não encontrada em {env_path}")

client = MongoClient(MONGO_URL)
col = client["moldz3d"]["products"]

produtos = list(col.find({}, {"name": 1, "_id": 0}).sort("name", 1))

print(f"\n📦  {len(produtos)} produto(s) no banco:\n")
for i, p in enumerate(produtos, 1):
    print(f"  {i:2}. {p['name']}")
print()

client.close()
