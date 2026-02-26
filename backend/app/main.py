"""Punto de entrada de la aplicación FastAPI."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import imdb, lists, movies

app = FastAPI(
    title="Gestor de Películas",
    description="API para gestionar tu catálogo de películas con persistencia en ficheros.",
    version="1.0.0",
)

# CORS — permitir el frontend en desarrollo y producción
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(movies.router)
app.include_router(lists.router)
app.include_router(imdb.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
