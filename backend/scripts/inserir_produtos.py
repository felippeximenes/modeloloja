"""
Insere os produtos do catálogo Moldz3D no MongoDB Atlas.

Como usar (a partir da raiz do projeto):
    python backend/scripts/inserir_produtos.py

Requisitos:
    pip install pymongo python-dotenv

O script lê a MONGO_URL do arquivo backend/.env automaticamente.
"""

import sys
import os
from datetime import datetime, timezone
from pathlib import Path

# ── Dependências ──────────────────────────────────────────────
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

# ── Catálogo de produtos ──────────────────────────────────────
PLACEHOLDER_IMG = "/produtos/gengar3.jpg"

def img(path):
    return path if path else PLACEHOLDER_IMG

def make_sku(base, variant=""):
    slug = base.upper().replace(" ", "-")[:20]
    var  = variant.upper().replace(" ", "-")[:10]
    return f"{slug}-{var}" if var else slug

produtos_raw = [

    # ─── SUPORTES DE CONTROLE ────────────────────────────────

    {
        "name": "Suporte Controle Gengar Pokémon",
        "description": "Suporte de controle em formato do Gengar, um dos Pokémon mais icônicos. Compatível com controles de PS4 e PS5. Dimensões: ~12x11x10cm. Material: PLA impresso em 3D.",
        "category": "Suporte",
        "images_main": ["/produtos/gengar3.jpg", "/produtos/gengar4.jpg"],
        "variations": [
            {"model": "Gengar", "color": "Liso",          "size": "12cm", "price": 59.90, "image": "/produtos/gengar3.jpg"},
            {"model": "Gengar", "color": "Estilo Felpudo", "size": "12cm", "price": 59.90, "image": "/produtos/gengar4.jpg"},
        ],
        "weight_kg": 0.2, "width_cm": 12, "height_cm": 11, "length_cm": 10,
    },
    {
        "name": "Suporte Controle Charizard Pokémon",
        "description": "Suporte de controle em formato da cabeça do Charizard. Compatível com PS5, PS4 e Xbox. Material: PLA impresso em 3D com alta qualidade.",
        "category": "Suporte",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Charizard", "color": "Padrão", "size": "15cm", "price": 49.63, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.2, "width_cm": 12, "height_cm": 12, "length_cm": 10,
    },
    {
        "name": "Suporte Controle Dragão Charizard 20cm",
        "description": "Suporte gamer em formato de Dragão estilo Charizard com 20cm de altura. Compatível com PS5, PS4, PC, Xbox e 8BitDo Ultimate.",
        "category": "Suporte",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Dragão Charizard", "color": "Laranja", "size": "20cm", "price": 63.92, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.3, "width_cm": 15, "height_cm": 20, "length_cm": 12,
    },
    {
        "name": "Suporte Controle Hollow Knight e Silksong",
        "description": "Suporte de controle temático Hollow Knight e Silksong. Compatível com PS5, PS4, PC, Xbox e 8BitDo Ultimate.",
        "category": "Suporte",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Hollow Knight", "color": "Padrão", "size": "10cm", "price": 27.92, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.15, "width_cm": 10, "height_cm": 10, "length_cm": 8,
    },
    {
        "name": "Suporte Controle Deadpool Marvel",
        "description": "Suporte de controle PS5 temático do Deadpool com espadas. Design gamer e decorativo. Material: PLA impresso em 3D.",
        "category": "Suporte",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Deadpool", "color": "Vermelho/Preto", "size": "15cm", "price": 59.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.2, "width_cm": 12, "height_cm": 15, "length_cm": 10,
    },
    {
        "name": "Suporte Controle Mão de Sauron - Senhor dos Anéis",
        "description": "Suporte de controle em formato da Mão de Sauron da trilogia Senhor dos Anéis. Compatível com PS5, PS4 e Xbox.",
        "category": "Suporte",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Mão de Sauron", "color": "Dourado/Preto", "size": "20cm", "price": 104.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.35, "width_cm": 15, "height_cm": 20, "length_cm": 12,
    },
    {
        "name": "Suporte Controle Goku Dragon Ball",
        "description": "Suporte de controle temático do Goku de Dragon Ball. Compatível com PS5, PS4, PC, Xbox e 8BitDo Ultimate.",
        "category": "Suporte",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Goku", "color": "Laranja/Azul", "size": "20cm", "price": 104.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.3, "width_cm": 15, "height_cm": 20, "length_cm": 12,
    },
    {
        "name": "Suporte Controle Diablo",
        "description": "Suporte de controle temático do jogo Diablo. Compatível com Xbox, PS5 e PS4.",
        "category": "Suporte",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Diablo", "color": "Preto/Vermelho", "size": "18cm", "price": 85.41, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.3, "width_cm": 15, "height_cm": 18, "length_cm": 12,
    },
    {
        "name": "Suporte Controle Minimalista Invisível",
        "description": "Suporte minimalista estilo invisível para controles. Compatível com PS5, PS4, PC, Xbox e 8BitDo Ultimate.",
        "category": "Suporte",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Minimalista", "color": "Preto",  "size": "10cm", "price": 12.90, "image": PLACEHOLDER_IMG},
            {"model": "Minimalista", "color": "Branco", "size": "10cm", "price": 12.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.05, "width_cm": 8, "height_cm": 3, "length_cm": 8,
    },
    {
        "name": "Suporte Controle e Headset Caveira",
        "description": "Organizador criativo em formato de caveira para controles e headset. Compatível com PS5 e acessórios gamer.",
        "category": "Suporte",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Caveira", "color": "Branco", "size": "20cm", "price": 59.42, "image": PLACEHOLDER_IMG},
            {"model": "Caveira", "color": "Preto",  "size": "20cm", "price": 59.42, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.35, "width_cm": 15, "height_cm": 20, "length_cm": 12,
    },
    {
        "name": "Suporte Headset e Controle Caveira 20cm",
        "description": "Suporte gamer para fone de ouvido e controle em formato de caveira com 20cm.",
        "category": "Suporte",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Caveira Grande", "color": "Branco", "size": "20cm", "price": 121.13, "image": PLACEHOLDER_IMG},
            {"model": "Caveira Grande", "color": "Preto",  "size": "20cm", "price": 121.13, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.5, "width_cm": 18, "height_cm": 20, "length_cm": 15,
    },
    {
        "name": "Suporte Controle Pro Nintendo Switch Barril DK",
        "description": "Suporte para controle Pro do Nintendo Switch em formato do barril do Donkey Kong.",
        "category": "Suporte",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Barril DK", "color": "Marrom", "size": "10cm", "price": 29.93, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.15, "width_cm": 10, "height_cm": 10, "length_cm": 10,
    },
    {
        "name": "Suporte Controle Pro Nintendo Switch Bullet Bill Mario",
        "description": "Suporte para controle Pro do Nintendo Switch 2 em formato do Bullet Bill do Mario.",
        "category": "Suporte",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Bullet Bill", "color": "Preto", "size": "12cm", "price": 44.91, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.15, "width_cm": 10, "height_cm": 12, "length_cm": 10,
    },

    # ─── ACESSÓRIOS DE CONSOLES ───────────────────────────────

    {
        "name": "Capa Dock Nintendo Switch 2 Temática Geek",
        "description": "Capa decorativa para o Dock do Nintendo Switch 2 em vários modelos temáticos (Zelda, Mario, Pikachu e outros).",
        "category": "Acessórios de Consoles",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Zelda",    "color": "Dourado",  "size": "Padrão", "price": 42.42, "image": PLACEHOLDER_IMG},
            {"model": "Mario",    "color": "Vermelho", "size": "Padrão", "price": 42.42, "image": PLACEHOLDER_IMG},
            {"model": "Pikachu",  "color": "Amarelo",  "size": "Padrão", "price": 42.42, "image": PLACEHOLDER_IMG},
            {"model": "Gengar",   "color": "Roxo",     "size": "Padrão", "price": 42.42, "image": PLACEHOLDER_IMG},
            {"model": "Triforce", "color": "Dourado",  "size": "Padrão", "price": 42.42, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.1, "width_cm": 12, "height_cm": 10, "length_cm": 5,
    },
    {
        "name": "Capa Dock Nintendo Switch 2 Super Mario 24 Placas Trocáveis",
        "description": "Capa temática ao estilo Super Mario para Dock do Switch 2 com mais de 24 placas trocáveis.",
        "category": "Acessórios de Consoles",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Super Mario", "color": "Vermelho/Azul", "size": "Padrão", "price": 47.92, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.15, "width_cm": 12, "height_cm": 10, "length_cm": 5,
    },
    {
        "name": "Capa Dock Nintendo Switch 2 Donkey Kong",
        "description": "Capa protetora do Donkey Kong para o Dock do Nintendo Switch 2. Design exclusivo impresso em 3D.",
        "category": "Acessórios de Consoles",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Donkey Kong", "color": "Marrom/Amarelo", "size": "Padrão", "price": 59.42, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.1, "width_cm": 12, "height_cm": 10, "length_cm": 5,
    },
    {
        "name": "Capa Dock Nintendo Switch OLED Zelda Tears of the Kingdom",
        "description": "Capa decorativa para o Dock do Nintendo Switch OLED com tema Zelda Tears of the Kingdom.",
        "category": "Acessórios de Consoles",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Zelda TOTK", "color": "Dourado/Verde", "size": "OLED", "price": 53.91, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.1, "width_cm": 12, "height_cm": 10, "length_cm": 5,
    },
    {
        "name": "Capa Case Dock Nintendo Switch OLED Anime",
        "description": "Capa de substituição para Dock do Nintendo Switch OLED e Normal com designs de anime.",
        "category": "Acessórios de Consoles",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Anime Mix",   "color": "Variado", "size": "OLED/Normal", "price": 31.41, "image": PLACEHOLDER_IMG},
            {"model": "Dragon Ball", "color": "Laranja", "size": "OLED/Normal", "price": 31.41, "image": PLACEHOLDER_IMG},
            {"model": "Naruto",      "color": "Laranja", "size": "OLED/Normal", "price": 31.41, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.08, "width_cm": 12, "height_cm": 10, "length_cm": 5,
    },
    {
        "name": "Grip Capa JoyCon Nintendo Switch 2 Mario",
        "description": "Grip e capa temática para JoyCons do Nintendo Switch 2 com tema Mario. Proteção e conforto para seus controles.",
        "category": "Acessórios de Consoles",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Mario Vermelho", "color": "Vermelho", "size": "Switch 2", "price": 39.90, "image": PLACEHOLDER_IMG},
            {"model": "Mario Azul",     "color": "Azul",     "size": "Switch 2", "price": 39.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.08, "width_cm": 10, "height_cm": 15, "length_cm": 3,
    },
    {
        "name": "Grip Capa JoyCon Pikachu Nintendo Switch 1 e 2",
        "description": "Grip e capa temática do Pikachu para JoyCons do Nintendo Switch 1 e 2.",
        "category": "Acessórios de Consoles",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Pikachu", "color": "Amarelo", "size": "Switch 1 e 2", "price": 39.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.08, "width_cm": 10, "height_cm": 15, "length_cm": 3,
    },
    {
        "name": "Adaptador Mouse JoyCon Nintendo Switch 2",
        "description": "Adaptador e agarrador de mouse para JoyCon do Nintendo Switch 2. Ergonômico e prático.",
        "category": "Acessórios de Consoles",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Adaptador Mouse", "color": "Preto",  "size": "Padrão", "price": 24.90, "image": PLACEHOLDER_IMG},
            {"model": "Adaptador Mouse", "color": "Branco", "size": "Padrão", "price": 24.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.05, "width_cm": 8, "height_cm": 6, "length_cm": 5,
    },
    {
        "name": "Suporte Dock Steam Deck",
        "description": "Estação de acoplamento para Steam Deck. Suporte em impressão 3D de alta qualidade.",
        "category": "Acessórios de Consoles",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Steam Deck Dock", "color": "Preto",  "size": "Padrão", "price": 39.90, "image": PLACEHOLDER_IMG},
            {"model": "Steam Deck Dock", "color": "Branco", "size": "Padrão", "price": 39.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.2, "width_cm": 15, "height_cm": 12, "length_cm": 10,
    },
    {
        "name": "Grade Ventoinha 120mm Pokémon Gengar Haunter Gastly",
        "description": "Kit de grade para ventoinha 120mm com tema Pokémon (Gengar, Haunter e Gastly). Proteção e estilo para PC Gamer.",
        "category": "Acessórios de Consoles",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Gengar",  "color": "Roxo",    "size": "120mm", "price": 11.90, "image": PLACEHOLDER_IMG},
            {"model": "Haunter", "color": "Roxo",    "size": "120mm", "price": 11.90, "image": PLACEHOLDER_IMG},
            {"model": "Gastly",  "color": "Roxo",    "size": "120mm", "price": 11.90, "image": PLACEHOLDER_IMG},
            {"model": "Kit 3",   "color": "Variado", "size": "120mm", "price": 29.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.05, "width_cm": 12, "height_cm": 12, "length_cm": 1,
    },

    # ─── DECORAÇÃO ────────────────────────────────────────────

    {
        "name": "Placa Decorativa Dead by Daylight 3D",
        "description": "Placa decorativa com logo do Dead by Daylight em impressão 3D. Ideal para decoração de setup gamer ou quarto temático.",
        "category": "Decoração",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Dead by Daylight", "color": "Preto/Vermelho", "size": "20cm", "price": 35.91, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.15, "width_cm": 20, "height_cm": 15, "length_cm": 2,
    },
    {
        "name": "Quadro Decorativo Batman 3D Máscara e Emblema",
        "description": "Quadro de parede com máscara e emblema do Batman em impressão 3D. Dimensões: 18x10cm.",
        "category": "Decoração",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Batman Máscara",  "color": "Preto/Cinza",  "size": "18x10cm", "price": 49.90, "image": PLACEHOLDER_IMG},
            {"model": "Batman Emblema", "color": "Preto/Amarelo", "size": "18x10cm", "price": 49.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.2, "width_cm": 18, "height_cm": 10, "length_cm": 2,
    },
    {
        "name": "Quadro Decorativo 3D Camadas Pokémon Batman Marvel DC",
        "description": "Quadros decorativos em camadas 3D com vários personagens: Pokémon, Batman, Marvel e DC.",
        "category": "Decoração",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Pokémon", "color": "Variado",     "size": "20cm", "price": 49.90, "image": PLACEHOLDER_IMG},
            {"model": "Batman",  "color": "Preto/Cinza", "size": "20cm", "price": 49.90, "image": PLACEHOLDER_IMG},
            {"model": "Marvel",  "color": "Variado",     "size": "20cm", "price": 49.90, "image": PLACEHOLDER_IMG},
            {"model": "DC",      "color": "Variado",     "size": "20cm", "price": 49.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.2, "width_cm": 20, "height_cm": 20, "length_cm": 2,
    },
    {
        "name": "Quadro Decorativo Pokébola Pokémon 20cm",
        "description": "Quadro decorativo em formato de Pokébola com silhuetas de Pokémon em impressão 3D. Tamanho: 20cm.",
        "category": "Decoração",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Pokébola", "color": "Vermelho/Branco", "size": "20cm", "price": 49.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.2, "width_cm": 20, "height_cm": 20, "length_cm": 2,
    },

    # ─── MINIATURAS ───────────────────────────────────────────

    {
        "name": "Miniatura Estátua Goku Dragon Ball Z 25cm",
        "description": "Miniatura estátua do Goku de Dragon Ball Z com 25cm. Impressão 3D de alta qualidade para colecionadores.",
        "category": "Miniaturas",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Goku Kaioken",       "color": "Laranja/Azul", "size": "25cm", "price": 89.90,  "image": PLACEHOLDER_IMG},
            {"model": "Goku Super Saiyajin","color": "Dourado",      "size": "25cm", "price": 99.90,  "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.4, "width_cm": 15, "height_cm": 25, "length_cm": 12,
    },
    {
        "name": "Miniatura Naruto Uzumaki 20cm",
        "description": "Miniatura do Naruto Uzumaki em impressão 3D com 20cm. Peça de coleção para fãs do anime.",
        "category": "Miniaturas",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Naruto Clássico", "color": "Laranja", "size": "20cm", "price": 79.90, "image": PLACEHOLDER_IMG},
            {"model": "Naruto Hokage",   "color": "Laranja", "size": "20cm", "price": 89.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.35, "width_cm": 12, "height_cm": 20, "length_cm": 10,
    },
    {
        "name": "Miniatura Link Zelda Breath of the Wild 15cm",
        "description": "Miniatura do Link de The Legend of Zelda: Breath of the Wild com 15cm. Impressão 3D detalhada.",
        "category": "Miniaturas",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Link BOTW", "color": "Azul/Bege", "size": "15cm", "price": 69.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.25, "width_cm": 10, "height_cm": 15, "length_cm": 8,
    },
    {
        "name": "Miniatura Mandalorian Star Wars 20cm",
        "description": "Miniatura do Mandalorian de Star Wars com 20cm. Peça exclusiva para fãs da franquia.",
        "category": "Miniaturas",
        "images_main": [PLACEHOLDER_IMG],
        "variations": [
            {"model": "Mando",         "color": "Prata/Preto", "size": "20cm", "price": 99.90,  "image": PLACEHOLDER_IMG},
            {"model": "Mando + Grogu", "color": "Prata/Verde", "size": "20cm", "price": 119.90, "image": PLACEHOLDER_IMG},
        ],
        "weight_kg": 0.4, "width_cm": 12, "height_cm": 20, "length_cm": 10,
    },
]


# ── Normaliza para o schema do banco ─────────────────────────

def build_document(raw):
    now = datetime.now(timezone.utc).isoformat()
    variations = []
    for v in raw["variations"]:
        slug = make_sku(raw["name"], f"{v['model']}-{v['color']}")
        variations.append({
            "sku":        slug,
            "model":      v["model"],
            "color":      v["color"],
            "size":       v["size"],
            "price":      v["price"],
            "image":      v.get("image", PLACEHOLDER_IMG),
            "weight_kg":  raw.get("weight_kg", 0.2),
            "width_cm":   raw.get("width_cm", 10),
            "height_cm":  raw.get("height_cm", 10),
            "length_cm":  raw.get("length_cm", 10),
            "stock":      10,
            "active":     True,
        })
    return {
        "name":        raw["name"],
        "description": raw["description"],
        "category":    raw["category"],
        "images":      raw.get("images_main", [PLACEHOLDER_IMG]),
        "variations":  variations,
        "active":      True,
        "created_at":  now,
        "updated_at":  now,
    }


# ── Conexão e inserção ────────────────────────────────────────

def main():
    print(f"🔌  Conectando ao MongoDB Atlas...")
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=8000)

    # Detecta o nome do banco da URL (ex: /moldz3d?retryWrites=...)
    db_name = MONGO_URL.split("/")[-1].split("?")[0] or "moldz3d"
    db = client[db_name]
    collection = db["products"]

    # Conta o que já existe para não duplicar
    existing = collection.count_documents({})
    print(f"📦  Produtos já existentes na collection: {existing}")

    docs = [build_document(p) for p in produtos_raw]

    print(f"📝  Inserindo {len(docs)} produtos...")
    result = collection.insert_many(docs)
    print(f"✅  {len(result.inserted_ids)} produtos inseridos com sucesso!")
    print(f"📊  Total na collection agora: {collection.count_documents({})}")

    client.close()


if __name__ == "__main__":
    main()
