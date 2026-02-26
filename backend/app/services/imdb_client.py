"""Servicio de integración con la API externa https://imdbapi.dev/."""

from __future__ import annotations

from typing import Optional

import httpx

from app.models.schemas import IMDBSearchResult

BASE_URL = "https://api.imdbapi.dev"
TIMEOUT = 15.0


async def search_movies(query: str) -> list[IMDBSearchResult]:
    """Busca películas en IMDB por título."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(f"{BASE_URL}/search/titles", params={"query": query})
        resp.raise_for_status()
        data = resp.json()

    results: list[IMDBSearchResult] = []
    # La API devuelve los resultados bajo la clave "titles"
    items = data.get("titles", []) if isinstance(data, dict) else data
    for item in items:
        try:
            # Extraer poster desde primaryImage.url
            poster = None
            primary_image = item.get("primaryImage")
            if isinstance(primary_image, dict):
                poster = primary_image.get("url")

            results.append(
                IMDBSearchResult(
                    imdb_id=item.get("id", ""),
                    title=item.get("primaryTitle") or item.get("originalTitle", ""),
                    year=_safe_int(item.get("startYear")),
                    poster=poster,
                    type=item.get("type"),
                )
            )
        except Exception:
            continue
    return results


async def get_movie_details(imdb_id: str) -> Optional[dict]:
    """Obtiene los detalles completos de una película por su IMDB ID."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(f"{BASE_URL}/titles/{imdb_id}")
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        data = resp.json()

    # Extraer poster desde primaryImage.url
    poster = None
    primary_image = data.get("primaryImage")
    if isinstance(primary_image, dict):
        poster = primary_image.get("url")

    # Extraer rating desde rating.aggregateRating
    imdb_rating = None
    rating_obj = data.get("rating")
    if isinstance(rating_obj, dict):
        imdb_rating = _safe_float(rating_obj.get("aggregateRating"))

    return {
        "title": data.get("primaryTitle") or data.get("originalTitle", ""),
        "year": _safe_int(data.get("startYear")),
        "genre": _join(data.get("genres")),
        "director": _join(data.get("directors")),
        "plot": data.get("plot", ""),
        "poster": poster or "",
        "imdb_id": imdb_id,
        "imdb_rating": imdb_rating,
    }


async def get_movie_images(imdb_id: str) -> list[dict]:
    """Obtiene todas las imágenes de una película por su IMDB ID."""
    all_images: list[dict] = []
    next_token: Optional[str] = None

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        while True:
            params = {}
            if next_token:
                params["pageToken"] = next_token
            resp = await client.get(f"{BASE_URL}/titles/{imdb_id}/images", params=params)
            if resp.status_code == 404:
                return []
            resp.raise_for_status()
            data = resp.json()

            for img in data.get("images", []):
                all_images.append({
                    "url": img.get("url", ""),
                    "width": img.get("width"),
                    "height": img.get("height"),
                    "type": img.get("type", ""),
                })

            next_token = data.get("nextPageToken")
            if not next_token:
                break

    return all_images


async def get_movie_videos(imdb_id: str) -> list[dict]:
    """Obtiene los vídeos de una película por su IMDB ID."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(f"{BASE_URL}/titles/{imdb_id}/videos")
        if resp.status_code == 404:
            return []
        resp.raise_for_status()
        data = resp.json()

    videos: list[dict] = []
    for vid in data.get("videos", []):
        thumbnail = None
        primary_image = vid.get("primaryImage")
        if isinstance(primary_image, dict):
            thumbnail = primary_image.get("url")

        videos.append({
            "id": vid.get("id", ""),
            "type": vid.get("type", ""),
            "name": vid.get("name", ""),
            "description": vid.get("description", ""),
            "thumbnail": thumbnail,
            "width": vid.get("width"),
            "height": vid.get("height"),
            "runtime_seconds": vid.get("runtimeSeconds"),
            "embed_url": f"https://www.imdb.com/videoembed/{vid.get('id', '')}",
        })

    return videos


def _safe_int(val) -> Optional[int]:
    if val is None:
        return None
    try:
        return int(str(val).split("–")[0].strip())
    except (ValueError, TypeError):
        return None


def _safe_float(val) -> Optional[float]:
    if val is None:
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def _join(val) -> Optional[str]:
    if val is None:
        return None
    if isinstance(val, list):
        # Puede ser lista de dicts con "displayName"/"name" o lista de strings
        parts = []
        for v in val:
            if isinstance(v, dict):
                parts.append(v.get("displayName") or v.get("name", str(v)))
            else:
                parts.append(str(v))
        return ", ".join(parts)
    return str(val)
