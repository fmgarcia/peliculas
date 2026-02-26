import { useState, useEffect } from "react";
import { getMovieImages } from "../services/api";

export default function ImageGallery({ imdbId, title, onClose }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMovieImages(imdbId);
        setImages(data.images || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [imdbId]);

  const types = ["all", ...new Set(images.map((i) => i.type).filter(Boolean))];
  const filtered =
    filter === "all" ? images : images.filter((i) => i.type === filter);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ width: "min(95vw, 1100px)", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2>🖼️ Imágenes — {title}</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="loading">
            <span className="spinner" /> Cargando imágenes…
          </div>
        ) : images.length === 0 ? (
          <div className="empty-state">
            <span>🖼️</span>
            <p>No se encontraron imágenes para esta película.</p>
          </div>
        ) : (
          <>
            {/* Filtros por tipo */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              {types.map((t) => (
                <button
                  key={t}
                  className={`btn btn-sm ${filter === t ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setFilter(t)}
                >
                  {t === "all" ? `Todas (${images.length})` : `${t} (${images.filter((i) => i.type === t).length})`}
                </button>
              ))}
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.8rem" }}>
              Mostrando {filtered.length} imagen(es)
            </p>

            {/* Grid de imágenes */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "0.6rem",
                maxHeight: "60vh",
                overflowY: "auto",
                padding: "0.2rem",
              }}
            >
              {filtered.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    cursor: "pointer",
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    transition: "transform 0.15s",
                  }}
                  onClick={() => setSelected(img)}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <img
                    src={img.url}
                    alt={`${title} - ${img.type}`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      padding: "0.3rem 0.5rem",
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      background: "var(--surface)",
                    }}
                  >
                    {img.type} · {img.width}×{img.height}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Lightbox — imagen ampliada */}
        {selected && (
          <div
            className="modal-overlay"
            style={{ zIndex: 300 }}
            onClick={() => setSelected(null)}
          >
            <div
              style={{
                position: "relative",
                maxWidth: "92vw",
                maxHeight: "90vh",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="btn btn-danger btn-sm"
                style={{ position: "absolute", top: "-12px", right: "-12px", zIndex: 10 }}
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
              <img
                src={selected.url}
                alt={title}
                style={{
                  maxWidth: "92vw",
                  maxHeight: "88vh",
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow)",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
