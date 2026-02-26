"""Modelos Pydantic para Movies y CustomLists."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Movie
# ---------------------------------------------------------------------------

class MovieBase(BaseModel):
    title: str
    year: Optional[int] = None
    genre: Optional[str] = None
    director: Optional[str] = None
    plot: Optional[str] = None
    poster: Optional[str] = None
    imdb_id: Optional[str] = None
    imdb_rating: Optional[float] = None


class MovieCreate(MovieBase):
    pass


class MovieUpdate(BaseModel):
    title: Optional[str] = None
    year: Optional[int] = None
    genre: Optional[str] = None
    director: Optional[str] = None
    plot: Optional[str] = None
    poster: Optional[str] = None
    imdb_id: Optional[str] = None
    imdb_rating: Optional[float] = None


class Movie(MovieBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ---------------------------------------------------------------------------
# CustomList
# ---------------------------------------------------------------------------

class CustomListBase(BaseModel):
    name: str
    description: Optional[str] = ""


class CustomListCreate(CustomListBase):
    pass


class CustomListUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CustomList(CustomListBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    movie_ids: list[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ---------------------------------------------------------------------------
# Modelos auxiliares para búsqueda IMDB
# ---------------------------------------------------------------------------

class IMDBSearchResult(BaseModel):
    imdb_id: str
    title: str
    year: Optional[int] = None
    poster: Optional[str] = None
    type: Optional[str] = None


class IMDBImportRequest(BaseModel):
    """Solicitud para importar películas por sus IDs de IMDB."""
    imdb_ids: list[str]
