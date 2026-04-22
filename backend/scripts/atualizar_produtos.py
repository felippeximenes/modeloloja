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
        "name": "Suporte Controle PS5 PS4 Gengar",
        "set": {
            "description": (
                "Destaque seu setup com muito mais estilo! "
                "Este suporte de controle em formato do Gengar, um dos Pokémon mais icônicos, "
                "é perfeito para fãs da franquia que também são gamers. "
                "Compatível com controles de PS4 e PS5, o suporte garante firmeza e um toque "
                "personalizado para sua mesa ou estante.\n\n"
                "🔸 Compatibilidade: Controles DualSense (PS5)\n\n"
                "🔸 Material: PLA (impresso em 3D com alta qualidade)\n\n"
                "🔸 Dimensões: Aproximadamente 12x11x10cm\n\n"
                "🔸 Controle não incluso\n\n"
                "🔸 Design exclusivo e criativo\n\n"
                "Ideal como presente geek ou item de decoração para colecionadores "
                "e jogadores apaixonados por Pokémon!"
            ),
        },
        "variation_images": {
            "Liso":          "/produtos/gengar5.jpg",
            " Estilo Felpudo": "/produtos/gengar13.jpg",
        },
    },

    {
        "name": "pokebolalexa",
        "set": {
            "name": "Suporte Alexa Echo Dot 4 5 Pokebola Pokemon Decorativo",
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
