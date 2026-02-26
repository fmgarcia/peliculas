/**
 * Cliente HTTP centralizado para comunicarse con el backend FastAPI.
 * En desarrollo usa el proxy de Vite; en producción usa el proxy nginx.
 */

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Error desconocido");
  }
  return res.json();
}

// ======================== Movies ========================

export const getMovies = () => request("/movies/");
export const getMovie = (id) => request(`/movies/${id}`);
export const createMovie = (data) =>
  request("/movies/", { method: "POST", body: JSON.stringify(data) });
export const updateMovie = (id, data) =>
  request(`/movies/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteMovie = (id) =>
  request(`/movies/${id}`, { method: "DELETE" });

// ======================== Lists ========================

export const getLists = () => request("/lists/");
export const getList = (id) => request(`/lists/${id}`);
export const createList = (data) =>
  request("/lists/", { method: "POST", body: JSON.stringify(data) });
export const updateList = (id, data) =>
  request(`/lists/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteList = (id) =>
  request(`/lists/${id}`, { method: "DELETE" });
export const addMovieToList = (listId, movieId) =>
  request(`/lists/${listId}/movies/${movieId}`, { method: "POST" });
export const removeMovieFromList = (listId, movieId) =>
  request(`/lists/${listId}/movies/${movieId}`, { method: "DELETE" });
export const getMoviesInList = (listId) =>
  request(`/lists/${listId}/movies`);

// ======================== IMDB ========================

export const searchIMDB = (query) =>
  request(`/imdb/search?query=${encodeURIComponent(query)}`);
export const importMovies = (imdbIds) =>
  request("/imdb/import", {
    method: "POST",
    body: JSON.stringify({ imdb_ids: imdbIds }),
  });
export const getMovieImages = (imdbId) =>
  request(`/imdb/images/${imdbId}`);
export const getMovieVideos = (imdbId) =>
  request(`/imdb/videos/${imdbId}`);
