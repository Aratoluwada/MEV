from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.requests import Request

from app.api.routes.check import router as check_router
from app.api.routes.health import router as health_router
from app.core.config import settings
from app.core.rate_limit import InMemoryRateLimiter
from app.db.connection import init_database
from app.db.repository import registry_repository


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    init_database()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Deterministic verification of medicine labels against NAFDAC regulatory records",
    lifespan=lifespan,
)

rate_limiter = InMemoryRateLimiter(
    max_requests=settings.api_rate_limit_requests,
    window_seconds=settings.api_rate_limit_window_seconds,
)


@app.middleware("http")
async def limit_api_requests(request: Request, call_next):
    if request.url.path.startswith("/api/v1/"):
        client_id = request.client.host if request.client else "unknown"
        if not rate_limiter.allow(client_id):
            return JSONResponse(
                status_code=429,
                content={"detail": "API request limit exceeded. Please try again shortly."},
                headers={"Retry-After": str(settings.api_rate_limit_window_seconds)},
            )
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(check_router)
