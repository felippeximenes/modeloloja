"""
Rotas administrativas — não requerem autenticação por ora.
"""

from __future__ import annotations

from fastapi import APIRouter
from pymongo import MongoClient

from app.core.config import MONGO_URL
from app.services.image_sync import sync_images

router = APIRouter(prefix="/api/admin")


@router.post("/sync-images")
def trigger_sync_images():
    """
    Dispara a sincronização de imagens manualmente.

    Útil após fazer deploy com novas fotos sem reiniciar o servidor.
    Exemplo: POST https://modeloloja.onrender.com/api/admin/sync-images
    """
    client = MongoClient(MONGO_URL)
    db_name = MONGO_URL.split("/")[-1].split("?")[0] or "moldz3d"
    col = client[db_name]["products"]

    results = sync_images(col)
    client.close()

    return {"synced": results}
