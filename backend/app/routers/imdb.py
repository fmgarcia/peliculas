"""Endpoints para búsqueda e importación masiva desde IMDB."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.schemas import IMDBImportRequest, IMDBSearchResult, Movie
from app.services.imdb_client import (
    get_movie_details,
    get_movie_images,
    get_movie_videos,
    search_movies,
)
from app.services.storage import store

router = APIRouter(prefix="/api/imdb", tags=["imdb"])


@router.get("/search", response_model=list[IMDBSearchResult])
async def search_imdb(query: str):
    """Busca películas en IMDB por título."""
    if not query or len(query.strip()) < 2:
        raise HTTPException(status_code=400, detail="La búsqueda debe tener al menos 2 caracteres")
    try:
        return await search_movies(query.strip())
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error al contactar IMDB API: {e}")


@router.post("/import", response_model=list[Movie])
async def import_movies(request: IMDBImportRequest):
    """Importa masivamente películas desde IMDB por sus IDs."""
    imported: list[Movie] = []
    errors: list[str] = []

    for imdb_id in request.imdb_ids:
        # Verificar si ya existe
        existing = [m for m in store.get_all_movies() if m.imdb_id == imdb_id]
        if existing:
            imported.append(existing[0])
            continue

        try:
            details = await get_movie_details(imdb_id)
            if details:
                movie = store.create_movie_from_dict(details)
                imported.append(movie)
            else:
                errors.append(f"No se encontró: {imdb_id}")
        except Exception as e:
            errors.append(f"Error importando {imdb_id}: {e}")

    return imported


@router.get("/images/{imdb_id}")
async def get_images(imdb_id: str):
    """Obtiene todas las imágenes de una película por su IMDB ID."""
    try:
        images = await get_movie_images(imdb_id)
        return {"imdb_id": imdb_id, "images": images, "total": len(images)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error al obtener imágenes: {e}")


@router.get("/videos/{imdb_id}")
async def get_videos(imdb_id: str):
    """Obtiene los vídeos de una película por su IMDB ID."""
    try:
        videos = await get_movie_videos(imdb_id)
        return {"imdb_id": imdb_id, "videos": videos, "total": len(videos)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error al obtener vídeos: {e}")
