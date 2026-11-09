"""FastAPI application main entrypoint for ResNet50 Deepfake Detection Assistant."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.routes import health, analyze, metrics
from backend.services.model_loader import get_model_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("deepfake_backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ResNet50 deepfake detection model once at application startup."""
    logger.info("Starting up ResNet50 Deepfake Detection Assistant Backend...")
    mm = get_model_manager()
    mm.load_all_models()
    yield
    logger.info("Shutting down ResNet50 Deepfake Detection Assistant Backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ResNet50 Deepfake Detection API (Trained and Evaluated on FaceForensics++)",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(analyze.router, prefix=settings.API_PREFIX)
app.include_router(metrics.router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "active_model": "ResNet50 (Fine-Tuned)",
        "status": "online",
        "docs_url": "/docs",
        "api_prefix": settings.API_PREFIX,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)
