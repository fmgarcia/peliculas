import { useState } from "react";

export default function MovieCard({ movie, onEdit, onDelete, lists, onAddToList, onShowImages, onShowVideos }) {
  const [showListMenu, setShowListMenu] = useState(false);

  return (
    <div className="card movie-card">
      {movie.poster ? (
        <img src={movie.poster} alt={movie.title} loading="lazy" />
      ) : (
        <div className="no-poster">🎬</div>
      )}
      <div className="movie-card-body">
        <h3>{movie.title}</h3>
        <p className="meta">
          {movie.year && <span>{movie.year}</span>}
          {movie.genre && <span> · {movie.genre}</span>}
          {movie.imdb_rating && <span> · ⭐ {movie.imdb_rating}</span>}
        </p>
        {movie.director && (
          <p className="meta">🎥 {movie.director}</p>
        )}

        {/* Botones de media — solo si tiene imdb_id */}
        {movie.imdb_id && (
          <div className="actions" style={{ paddingTop: "0.4rem" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onShowImages(movie)}
              title="Ver imágenes"
            >
              🖼️ Imágenes
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onShowVideos(movie)}
              title="Ver vídeos"
            >
              🎥 Vídeos
            </button>
          </div>
        )}

        <div className="actions">
          <button className="btn btn-primary btn-sm" onClick={() => onEdit(movie)}>
            ✏️ Editar
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(movie.id)}>
            🗑️
          </button>
          {lists && lists.length > 0 && (
            <div style={{ position: "relative" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowListMenu(!showListMenu)}
              >
                📋+
              </button>
              {showListMenu && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "110%",
                    right: 0,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "0.5rem",
                    zIndex: 10,
                    minWidth: "180px",
                  }}
                >
                  {lists.map((l) => (
                    <div
                      key={l.id}
                      style={{
                        padding: "0.4rem 0.6rem",
                        cursor: "pointer",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                      }}
                      className="list-item"
                      onClick={() => {
                        onAddToList(l.id, movie.id);
                        setShowListMenu(false);
                      }}
                    >
                      {l.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
