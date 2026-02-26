import { useState, useEffect, useCallback } from "react";
import {
  getLists,
  createList,
  updateList,
  deleteList,
  getMoviesInList,
  removeMovieFromList,
} from "../services/api";
import ListForm from "../components/ListForm";

export default function ListsPage() {
  const [lists, setLists] = useState([]);
  const [selected, setSelected] = useState(null);
  const [listMovies, setListMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadLists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLists();
      setLists(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const selectList = async (list) => {
    setSelected(list);
    try {
      const movies = await getMoviesInList(list.id);
      setListMovies(movies);
    } catch {
      setListMovies([]);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateList(editing.id, data);
      } else {
        await createList(data);
      }
      setShowForm(false);
      setEditing(null);
      loadLists();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteList = async (id) => {
    if (!confirm("¿Eliminar esta lista?")) return;
    try {
      await deleteList(id);
      if (selected?.id === id) {
        setSelected(null);
        setListMovies([]);
      }
      loadLists();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveMovie = async (movieId) => {
    if (!selected) return;
    try {
      await removeMovieFromList(selected.id, movieId);
      selectList(selected);
      loadLists();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="toolbar">
        <h2>Listas Personalizadas</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Nueva Lista
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <span className="spinner" /> Cargando…
        </div>
      ) : lists.length === 0 ? (
        <div className="empty-state">
          <span>📋</span>
          <p>No hay listas. ¡Crea una para organizar tus películas!</p>
        </div>
      ) : (
        <div className="list-sidebar">
          {/* Panel izquierdo: listas */}
          <div className="list-panel">
            {lists.map((l) => (
              <div
                key={l.id}
                className={`list-item ${selected?.id === l.id ? "active" : ""}`}
                onClick={() => selectList(l)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4>{l.name}</h4>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(l);
                        setShowForm(true);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteList(l.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p>{l.description || "Sin descripción"}</p>
                <p style={{ fontSize: "0.78rem", marginTop: "0.2rem" }}>
                  {l.movie_ids.length} película(s)
                </p>
              </div>
            ))}
          </div>

          {/* Panel derecho: películas de la lista seleccionada */}
          <div>
            {selected ? (
              <>
                <h3 style={{ marginBottom: "1rem" }}>
                  Películas en "{selected.name}"
                </h3>
                {listMovies.length === 0 ? (
                  <div className="empty-state">
                    <span>📭</span>
                    <p>Lista vacía. Añade películas desde la página principal.</p>
                  </div>
                ) : (
                  <div className="grid">
                    {listMovies.map((m) => (
                      <div key={m.id} className="card movie-card">
                        {m.poster ? (
                          <img src={m.poster} alt={m.title} loading="lazy" />
                        ) : (
                          <div className="no-poster">🎬</div>
                        )}
                        <div className="movie-card-body">
                          <h3>{m.title}</h3>
                          <p className="meta">
                            {m.year && <span>{m.year}</span>}
                            {m.genre && <span> · {m.genre}</span>}
                            {m.imdb_rating && <span> · ⭐ {m.imdb_rating}</span>}
                          </p>
                          <div className="actions">
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveMovie(m.id)}
                            >
                              Quitar de la lista
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <span>👈</span>
                <p>Selecciona una lista para ver sus películas.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <ListForm
          list={editing}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
