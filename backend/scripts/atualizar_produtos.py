"""
Atualiza campos de produtos existentes no MongoDB Atlas, buscando pelo nome.
Não recria documentos — usa updateOne com $set.

Como usar (a partir da raiz do projeto):
    python backend/scripts/atualizar_produtos.py

Requisitos:
    pip install pymongo python-dotenv
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

# ── Carrega .env do backend ───────────────────────────────────
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    sys.exit(f"❌  MONGO_URL não encontrada em {env_path}")

# ── Atualizações a aplicar ────────────────────────────────────
# Cada item: busca pelo "name" e aplica os campos em "set".
# Só os campos listados em "set" são alterados — o resto permanece intacto.

UPDATES = [
  {
    "name": "Colecionável Invincible Invencivel 3D 22cm Decorativo Geek",
    "set": {
        "variations.0.price": 69.90,
        "variations.0.color": "Amarelo e Azul",
        "variations.0.model": "Invincible 22cm",
        "variations.0.image": "/produtos/invencible/amarelo-01.jpg",
        "variations.1.price": 69.90,
        "variations.1.color": "Azul",
        "variations.1.model": "Invincible 22cm",
        "variations.1.image": "/produtos/invencible/azul.jpg",
      "categories": ["Colecionavel", "Invincible", "Geek", "Decoracao", "Impressao3D"],
      "description": (
        "O herói mais invencível do universo agora mora na sua estante! "
        "Esta figura colecionável do Invincible, feita com impressão 3D de alta precisão, "
        "é o item que todo fã da série da Amazon Prime estava esperando. "
        "Com 22 cm de altura, acabamento detalhado e pintura manual brilhante, "
        "ela não é só uma peça decorativa — é um símbolo de bom gosto geek.\n\n"
        " ◆  Altura: 22 cm\n\n"
        " ◆  Material: PLA biodegradável de alta resistência\n\n"
        " ◆  Pintura manual com acabamento brilhante\n\n"
        " ◆  Base de sustentação inclusa\n\n"
        " ◆  Disponível em duas variações: Amarelo e Azul / Azul e Preto\n\n"
        " ◆  Produzido sob encomenda com tecnologia de impressão 3D de alta precisão\n\n"
        "Perfeito para decorar mesas, estantes e escritórios com atitude. "
        "Ideal como presente geek para colecionadores e fãs apaixonados "
        "pelo universo do Invincible!"
      ),
    },
  },
]

# ── Conexão ───────────────────────────────────────────────────
client = MongoClient(MONGO_URL)
db_name = MONGO_URL.split("/")[-1].split("?")[0] or "moldz3d"
db = client[db_name]
col = db["products"]

# ── Aplica atualizações ───────────────────────────────────────
print(f"\n📦  Processando {len(UPDATES)} atualização(ões)...\n")

for item in UPDATES:
    name = item["name"]
    result = col.update_one({"name": name}, {"$set": item["set"]})

    if result.matched_count == 0:
        print(f"  ⚠️  Não encontrado: '{name}'")
    elif result.modified_count == 0:
        print(f"  ✔  Sem mudanças (já estava igual): '{name}'")
    else:
        fields = ", ".join(item["set"].keys())
        print(f"  ✅  Atualizado [{fields}]: '{name}'")

    # Atualiza imagem de cada variação individualmente
    if "variation_images" in item:
        for color, image_path in item["variation_images"].items():
            res = col.update_one(
                {"name": name, "variations.color": color},
                {"$set": {"variations.$.image": image_path}}
            )
            if res.matched_count == 0:
                print(f"  ⚠️  Variação não encontrada: '{color}'")
            else:
                print(f"  🖼️   Variação '{color}' → {image_path}")

print("\nConcluído.\n")
client.close()
