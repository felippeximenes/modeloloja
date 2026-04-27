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
    "name": "Miniatura Link Zelda Breath of the Wild 15cm",
    "set": {
      "name": "Placa Decorativa Dead by Daylight Logo 3D Gamer Horror Parede Impressão Geek Setup",
      "categories": ["Decoracao", "Gamer", "Geek", "Impressao3D", "Horror"],
      "variations.0.price": 35.91,
      "description": (
        "Deixe seu Setup com a Alma do Entity — Placa Decorativa Dead by Daylight 3D. "
        "Imagina só: você está no seu setup favorito, aquele cantinho geek que é literalmente a sua identidade. "
        "Agora imagina o logo icônico de Dead by Daylight ali, em 3D, olhando pra você com toda aquela energia sombria e inconfundível do jogo. "
        "Não é um simples enfeite de prateleira — é uma escultura tridimensional com camadas de cor e contorno que parecem saltar da superfície.\n\n"
        " 🪓  Altura: 15 cm\n\n"
        " 🪓  Material: PLA ecológico de alta resistência\n\n"
        " 🪓  Design 3D com camadas de cor e contorno precisos\n\n"
        " 🪓  Base estável para exposição em prateleiras e mesas\n\n"
        " 🪓  Sem necessidade de montagem — chegou, colocou, ficou lindo\n\n"
        " 🪓  100% produzido no Brasil com tecnologia de impressão 3D de alta precisão\n\n"
        "Perfeito para decorar setups, prateleiras e estúdios com atitude. "
        "Ideal como presente geek para colecionadores e fãs apaixonados "
        "pelo universo de Dead by Daylight!"
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
