import { useState, useEffect, useCallback } from "react";
import {
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  getLists,
  addMovieToList,
} from "../services/api";
import MovieCard from "../components/MovieCard";
import MovieForm from "../components/MovieForm";
import ImageGallery from "../components/ImageGallery";
import VideoPlayer from "../components/VideoPlayer";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [mediaMovie, setMediaMovie] = useState(null); // película seleccionada para media
  const [mediaType, setMediaType] = useState(null);   // "images" | "videos"

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, l] = await Promise.all([getMovies(), getLists()]);
      setMovies(m);
      setLists(l);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateMovie(editing.id, data);
      } else {
        await createMovie(data);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta película?")) return;
    try {
      await deleteMovie(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (movie) => {
    setEditing(movie);
    setShowForm(true);
  };

  const handleAddToList = async (listId, movieId) => {
    try {
      await addMovieToList(listId, movieId);
      alert("Película añadida a la lista");
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="toolbar">
        <h2>Películas ({filtered.length})</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Nueva Película
        </button>
      </div>

      <div className="search-bar">
        <input
          placeholder="Buscar por título…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">
          <span className="spinner" /> Cargando…
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span>🎬</span>
          <p>No hay películas. ¡Añade una o importa desde IMDB!</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((m) => (
            <MovieCard
              key={m.id}
              movie={m}
              lists={lists}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddToList={handleAddToList}
              onShowImages={(movie) => { setMediaMovie(movie); setMediaType("images"); }}
              onShowVideos={(movie) => { setMediaMovie(movie); setMediaType("videos"); }}
            />
          ))}
        </div>
      )}

      {showForm && (
        <MovieForm
          movie={editing}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {mediaMovie && mediaType === "images" && (
        <ImageGallery
          imdbId={mediaMovie.imdb_id}
          title={mediaMovie.title}
          onClose={() => { setMediaMovie(null); setMediaType(null); }}
        />
      )}

      {mediaMovie && mediaType === "videos" && (
        <VideoPlayer
          imdbId={mediaMovie.imdb_id}
          title={mediaMovie.title}
          onClose={() => { setMediaMovie(null); setMediaType(null); }}
        />
      )}
    </>
  );
}
