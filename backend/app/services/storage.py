"""Servicio de persistencia en ficheros JSON.

Carga los datos al iniciar la app y los vuelca a disco
en cada operación de escritura para garantizar durabilidad.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional

from app.models.schemas import (
    CustomList,
    CustomListCreate,
    CustomListUpdate,
    Movie,
    MovieCreate,
    MovieUpdate,
)

DATA_DIR = Path(os.getenv("DATA_DIR", "data"))
MOVIES_FILE = DATA_DIR / "movies.json"
LISTS_FILE = DATA_DIR / "lists.json"


class DataStore:
    """Almacén en memoria con persistencia JSON."""

    def __init__(self) -> None:
        self.movies: dict[str, Movie] = {}
        self.lists: dict[str, CustomList] = {}
        self._ensure_data_dir()
        self._load()

    # ------------------------------------------------------------------
    # Inicialización
    # ------------------------------------------------------------------

    def _ensure_data_dir(self) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)

    def _load(self) -> None:
        """Carga los ficheros JSON existentes en memoria."""
        if MOVIES_FILE.exists():
            with open(MOVIES_FILE, "r", encoding="utf-8") as f:
                raw = json.load(f)
                for item in raw:
                    m = Movie(**item)
                    self.movies[m.id] = m

        if LISTS_FILE.exists():
            with open(LISTS_FILE, "r", encoding="utf-8") as f:
                raw = json.load(f)
                for item in raw:
                    cl = CustomList(**item)
                    self.lists[cl.id] = cl

    # ------------------------------------------------------------------
    # Volcado a disco
    # ------------------------------------------------------------------

    def _save_movies(self) -> None:
        with open(MOVIES_FILE, "w", encoding="utf-8") as f:
            json.dump(
                [m.model_dump() for m in self.movies.values()],
                f,
                ensure_ascii=False,
                indent=2,
            )

    def _save_lists(self) -> None:
        with open(LISTS_FILE, "w", encoding="utf-8") as f:
            json.dump(
                [cl.model_dump() for cl in self.lists.values()],
                f,
                ensure_ascii=False,
                indent=2,
            )

    # ------------------------------------------------------------------
    # CRUD — Películas
    # ------------------------------------------------------------------

    def get_all_movies(self) -> list[Movie]:
        return list(self.movies.values())

    def get_movie(self, movie_id: str) -> Optional[Movie]:
        return self.movies.get(movie_id)

    def create_movie(self, data: MovieCreate) -> Movie:
        movie = Movie(**data.model_dump())
        self.movies[movie.id] = movie
        self._save_movies()
        return movie

    def create_movie_from_dict(self, data: dict) -> Movie:
        """Crea una película directamente desde un dict (usado en importación)."""
        movie = Movie(**data)
        self.movies[movie.id] = movie
        self._save_movies()
        return movie

    def update_movie(self, movie_id: str, data: MovieUpdate) -> Optional[Movie]:
        movie = self.movies.get(movie_id)
        if not movie:
            return None
        update_data = data.model_dump(exclude_unset=True)
        updated = movie.model_copy(update=update_data)
        self.movies[movie_id] = updated
        self._save_movies()
        return updated

    def delete_movie(self, movie_id: str) -> bool:
        if movie_id not in self.movies:
            return False
        del self.movies[movie_id]
        # Limpiar de todas las listas
        for cl in self.lists.values():
            if movie_id in cl.movie_ids:
                cl.movie_ids.remove(movie_id)
        self._save_movies()
        self._save_lists()
        return True

    # ------------------------------------------------------------------
    # CRUD — Listas personalizadas
    # ------------------------------------------------------------------

    def get_all_lists(self) -> list[CustomList]:
        return list(self.lists.values())

    def get_list(self, list_id: str) -> Optional[CustomList]:
        return self.lists.get(list_id)

    def create_list(self, data: CustomListCreate) -> CustomList:
        cl = CustomList(**data.model_dump())
        self.lists[cl.id] = cl
        self._save_lists()
        return cl

    def update_list(self, list_id: str, data: CustomListUpdate) -> Optional[CustomList]:
        cl = self.lists.get(list_id)
        if not cl:
            return None
        update_data = data.model_dump(exclude_unset=True)
        updated = cl.model_copy(update=update_data)
        self.lists[list_id] = updated
        self._save_lists()
        return updated

    def delete_list(self, list_id: str) -> bool:
        if list_id not in self.lists:
            return False
        del self.lists[list_id]
        self._save_lists()
        return True

    def add_movie_to_list(self, list_id: str, movie_id: str) -> Optional[CustomList]:
        cl = self.lists.get(list_id)
        if not cl:
            return None
        if movie_id not in self.movies:
            return None
        if movie_id not in cl.movie_ids:
            cl.movie_ids.append(movie_id)
            self._save_lists()
        return cl

    def remove_movie_from_list(self, list_id: str, movie_id: str) -> Optional[CustomList]:
        cl = self.lists.get(list_id)
        if not cl:
            return None
        if movie_id in cl.movie_ids:
            cl.movie_ids.remove(movie_id)
            self._save_lists()
        return cl


# Singleton global
store = DataStore()
