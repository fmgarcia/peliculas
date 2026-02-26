"""Endpoints CRUD de listas personalizadas."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.schemas import CustomList, CustomListCreate, CustomListUpdate, Movie
from app.services.storage import store

router = APIRouter(prefix="/api/lists", tags=["lists"])


@router.get("/", response_model=list[CustomList])
def list_custom_lists():
    return store.get_all_lists()


@router.get("/{list_id}", response_model=CustomList)
def get_custom_list(list_id: str):
    cl = store.get_list(list_id)
    if not cl:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    return cl


@router.post("/", response_model=CustomList, status_code=201)
def create_custom_list(data: CustomListCreate):
    return store.create_list(data)


@router.put("/{list_id}", response_model=CustomList)
def update_custom_list(list_id: str, data: CustomListUpdate):
    cl = store.update_list(list_id, data)
    if not cl:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    return cl


@router.delete("/{list_id}", status_code=204)
def delete_custom_list(list_id: str):
    if not store.delete_list(list_id):
        raise HTTPException(status_code=404, detail="Lista no encontrada")


# ------------------------------------------------------------------
# Gestión de películas dentro de una lista
# ------------------------------------------------------------------

@router.post("/{list_id}/movies/{movie_id}", response_model=CustomList)
def add_movie_to_list(list_id: str, movie_id: str):
    cl = store.add_movie_to_list(list_id, movie_id)
    if not cl:
        raise HTTPException(
            status_code=404,
            detail="Lista o película no encontrada",
        )
    return cl


@router.delete("/{list_id}/movies/{movie_id}", response_model=CustomList)
def remove_movie_from_list(list_id: str, movie_id: str):
    cl = store.remove_movie_from_list(list_id, movie_id)
    if not cl:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    return cl


@router.get("/{list_id}/movies", response_model=list[Movie])
def get_movies_in_list(list_id: str):
    """Devuelve los objetos Movie completos de una lista."""
    cl = store.get_list(list_id)
    if not cl:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    movies = []
    for mid in cl.movie_ids:
        m = store.get_movie(mid)
        if m:
            movies.append(m)
    return movies
