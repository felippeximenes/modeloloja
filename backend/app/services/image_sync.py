"""
Serviço de sincronização automática de imagens.

Lê backend/image-sync-config.json, varre subpastas de app/public/produtos/
e atualiza os campos `images` e `variations[*].image` no MongoDB.

Chamado automaticamente no startup do FastAPI e pelo endpoint
POST /api/admin/sync-images.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Extensões aceitas
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

# Caminhos base
CONFIG_PATH  = Path(__file__).parents[2] / "image-sync-config.json"
PRODUTOS_DIR = Path(__file__).parents[3] / "frontend" / "public" / "produtos"


def _load_config() -> dict:
    if not CONFIG_PATH.exists():
        logger.warning(f"image-sync-config.json não encontrado em {CONFIG_PATH}")
        return {}
    with open(CONFIG_PATH, encoding="utf-8") as f:
        raw = json.load(f)
    # Remove chaves de comentário
    return {k: v for k, v in raw.items() if not k.startswith("_")}


def _list_images(folder: Path) -> list[str]:
    """Retorna lista de caminhos públicos das imagens, ordenada por nome."""
    return sorted([
        f"/produtos/{folder.name}/{f.name}"
        for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS
    ])


def _find_variation_image(images: list[str], prefix: str) -> str | None:
    """Retorna a primeira imagem cujo nome começa com o prefixo dado."""
    for path in images:
        filename = path.rsplit("/", 1)[-1].lower()
        if filename.startswith(prefix.lower()):
            return path
    return None


def sync_images(col) -> dict:
    """
    Sincroniza imagens de todas as pastas configuradas.

    Parâmetros:
        col: coleção MongoDB de produtos (síncrona, pymongo)

    Retorna dict com resultado por produto.
    """
    config = _load_config()
    results = {}

    if not PRODUTOS_DIR.exists():
        logger.warning(f"Pasta de produtos não encontrada: {PRODUTOS_DIR}")
        return results

    for folder_name, cfg in config.items():
        folder = PRODUTOS_DIR / folder_name
        product_name = cfg.get("product_name", "")
        variation_prefixes: dict = cfg.get("variation_prefixes", {})

        if not folder.is_dir():
            results[folder_name] = {"status": "pasta_nao_encontrada"}
            logger.warning(f"Pasta '{folder_name}' não existe em {PRODUTOS_DIR}")
            continue

        images = _list_images(folder)

        if not images:
            results[folder_name] = {"status": "sem_imagens"}
            continue

        # Monta o $set base com todas as imagens
        update: dict = {"images": images}

        # Atualiza imagem de cada variação individualmente
        variation_updates = []
        for color, prefix in variation_prefixes.items():
            img = _find_variation_image(images, prefix)
            if img:
                variation_updates.append((color, img))

        # Aplica atualização principal
        result = col.update_one({"name": product_name}, {"$set": update})

        if result.matched_count == 0:
            results[folder_name] = {"status": "produto_nao_encontrado", "name": product_name}
            logger.warning(f"Produto não encontrado no banco: '{product_name}'")
            continue

        # Aplica imagens das variações
        for color, img_path in variation_updates:
            col.update_one(
                {"name": product_name, "variations.color": color},
                {"$set": {"variations.$.image": img_path}}
            )

        results[folder_name] = {
            "status": "ok",
            "product": product_name,
            "images_count": len(images),
            "variations_updated": [c for c, _ in variation_updates],
        }
        logger.info(f"✅ Sincronizado '{product_name}': {len(images)} imagem(ns)")

    return results
