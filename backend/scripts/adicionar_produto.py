"""
Insere um produto novo no MongoDB, apenas se ainda não existir pelo nome.

Como usar:
    python backend/scripts/adicionar_produto.py

Edite a seção NOVO PRODUTO abaixo antes de rodar.
"""

import sys
import os
from datetime import datetime, timezone
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

# ──────────────────────────────────────────────────────────────
# NOVO PRODUTO — edite aqui
# ──────────────────────────────────────────────────────────────

PRODUTO = {
    "name": "pokebolalexa",           # Nome que aparece no site
    "description": (
        "Suporte decorativo em formato de Pokébola, "
        "compatível com a Amazon Alexa Echo Dot. "
        "Impresso em 3D com PLA de alta qualidade.\n\n"
        "🔸 Compatibilidade: Echo Dot (3ª, 4ª e 5ª geração)\n\n"
        "🔸 Material: PLA\n\n"
        "🔸 Design exclusivo"
    ),
    "category": "Decoração",            # Suporte | Decoração | Miniatura | etc.
    "images": [],                       # Deixe vazio — o image-sync preenche automaticamente
    "variations": [
        {
            "sku": "POKEBOLALEXA-PAD",
            "model": "Pokébola Alexa",
            "color": "Padrão",
            "size": "Único",
            "price": 59.42,
            "weight_kg": 0.15,
            "width_cm": 10,
            "height_cm": 10,
            "length_cm": 10,
            "stock": 10,
            "active": True,
            "image": "",                # Deixe vazio — o image-sync preenche
        }
    ],
    "active": True,
}

# ──────────────────────────────────────────────────────────────

def main():
    client = MongoClient(MONGO_URL)
    db_name = MONGO_URL.split("/")[-1].split("?")[0] or "moldz3d"
    col = client[db_name]["products"]

    name = PRODUTO["name"]

    if col.find_one({"name": name}):
        print(f"⚠️  Produto já existe no banco: '{name}' — nenhuma alteração feita.")
        print("     Use atualizar_produtos.py para editar produtos existentes.")
        client.close()
        return

    now = datetime.now(timezone.utc).isoformat()
    doc = {**PRODUTO, "created_at": now, "updated_at": now}

    result = col.insert_one(doc)
    print(f"✅  Produto inserido: '{name}' (id: {result.inserted_id})")
    client.close()


if __name__ == "__main__":
    main()
