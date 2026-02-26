"""Endpoints CRUD de películas."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.schemas import Movie, MovieCreate, MovieUpdate
from app.services.storage import store

router = APIRouter(prefix="/api/movies", tags=["movies"])


@router.get("/", response_model=list[Movie])
def list_movies():
    return store.get_all_movies()


@router.get("/{movie_id}", response_model=Movie)
def get_movie(movie_id: str):
    movie = store.get_movie(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Película no encontrada")
    return movie


@router.post("/", response_model=Movie, status_code=201)
def create_movie(data: MovieCreate):
    return store.create_movie(data)


@router.put("/{movie_id}", response_model=Movie)
def update_movie(movie_id: str, data: MovieUpdate):
    movie = store.update_movie(movie_id, data)
    if not movie:
        raise HTTPException(status_code=404, detail="Película no encontrada")
    return movie


@router.delete("/{movie_id}", status_code=204)
def delete_movie(movie_id: str):
    if not store.delete_movie(movie_id):
        raise HTTPException(status_code=404, detail="Película no encontrada")
