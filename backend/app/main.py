from __future__ import annotations

import logging
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS
from app.db.mongo import close_db

from app.routes.products import router as products_router
from app.routes.shipping import router as shipping_router
from app.routes.melhorenvio_oauth import router as oauth_router
from app.routes.orders import router as orders_router
from app.routes.payments import router as payments_router  

# ---------------------------
# Logging
# ---------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# ---------------------------
# App
# ---------------------------
app = FastAPI(
    title="Modelo Loja API",
    version="1.0.0",
)

# ---------------------------
# Middlewares
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS.split(",")] if CORS_ORIGINS else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Routers
# ---------------------------
app.include_router(products_router)
app.include_router(shipping_router)
app.include_router(oauth_router)
app.include_router(orders_router)
app.include_router(payments_router) 

# ---------------------------
# Shutdown
# ---------------------------
@app.on_event("shutdown")
async def shutdown_db_client():
    close_db()