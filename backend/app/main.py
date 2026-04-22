
from __future__ import annotations

import logging
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS, MONGO_URL
from app.db.mongo import close_db
from app.services.image_sync import sync_images

from app.routes.products import router as products_router
from app.routes.shipping import router as shipping_router
from app.routes.melhorenvio_oauth import router as oauth_router
from app.routes.orders import router as orders_router
from app.routes.payments import router as payments_router
from app.routes.webhooks import router as webhooks_router
from app.routes.auth import router as auth_router
from app.routes.addresses import router as addresses_router
from app.routes.admin import router as admin_router


# ======================================
# LOGGING
# ======================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# ======================================
# APP
# ======================================

app = FastAPI(
    title="Modelo Loja API",
    version="1.0.0",
)


# ======================================
# CORS
# ======================================

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS.split(",")] if CORS_ORIGINS else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ======================================
# STATIC FILES (IMAGENS DOS PRODUTOS)
# ======================================

app.mount(
    "/produtos",
    StaticFiles(directory="app/public/produtos"),
    name="produtos",
)


# ======================================
# ROUTERS
# ======================================

app.include_router(products_router)
app.include_router(shipping_router)
app.include_router(oauth_router)
app.include_router(orders_router)
app.include_router(payments_router)
app.include_router(webhooks_router)
app.include_router(auth_router)
app.include_router(addresses_router)
app.include_router(admin_router)



# ======================================
# HEALTH CHECK (PROFISSIONAL)
# ======================================

@app.get("/health")
async def health():
    return {"status": "ok"}


# ======================================
# STARTUP — sincroniza imagens automaticamente
# ======================================

@app.on_event("startup")
async def startup_sync_images():
    try:
        from pymongo import MongoClient
        client = MongoClient(MONGO_URL)
        db_name = MONGO_URL.split("/")[-1].split("?")[0] or "moldz3d"
        col = client[db_name]["products"]
        results = sync_images(col)
        client.close()
        logging.info(f"Image sync on startup: {results}")
    except Exception as e:
        logging.warning(f"Image sync on startup failed (non-fatal): {e}")


# ======================================
# SHUTDOWN
# ======================================

@app.on_event("shutdown")
async def shutdown_db_client():
    close_db()