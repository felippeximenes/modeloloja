"""
Sincroniza imagens dos produtos com o MongoDB Atlas.

Lê image-sync-config.json, varre subpastas de frontend/public/produtos/
e atualiza os campos `images` e `variations[*].image` no MongoDB.

Como usar:
    python backend/scripts/sincronizar_imagens.py
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

# Reutiliza o serviço já criado no backend
sys.path.insert(0, str(Path(__file__).parents[1]))
from app.services.image_sync import sync_images

client = MongoClient(MONGO_URL)
db_name = MONGO_URL.split("/")[-1].split("?")[0] or "moldz3d"
col = client[db_name]["products"]

print("\n🖼️   Sincronizando imagens...\n")
results = sync_images(col)

for folder, info in results.items():
    status = info.get("status")
    if status == "ok":
        print(f"  ✅  {info['product']}: {info['images_count']} foto(s)")
        if info.get("variations_updated"):
            for v in info["variations_updated"]:
                print(f"       variação '{v}' atualizada")
    elif status == "produto_nao_encontrado":
        print(f"  ❌  Pasta '{folder}': produto '{info['product']}' não encontrado no banco")
    elif status == "pasta_nao_encontrada":
        print(f"  ⚠️  Pasta '{folder}' não existe em frontend/public/produtos/")
    elif status == "sem_imagens":
        print(f"  ⚠️  Pasta '{folder}' está vazia")

print("\nConcluído.\n")
client.close()
