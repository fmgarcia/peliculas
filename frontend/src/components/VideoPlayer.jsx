import { useState, useEffect } from "react";
import { getMovieVideos } from "../services/api";

function formatDuration(seconds) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VideoPlayer({ imdbId, title, onClose }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMovieVideos(imdbId);
        const vids = data.videos || [];
        setVideos(vids);
        if (vids.length > 0) setActiveVideo(vids[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [imdbId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ width: "min(95vw, 1000px)", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2>🎥 Vídeos — {title}</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="loading">
            <span className="spinner" /> Cargando vídeos…
          </div>
        ) : videos.length === 0 ? (
          <div className="empty-state">
            <span>🎥</span>
            <p>No se encontraron vídeos para esta película.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Reproductor principal */}
            {activeVideo && (
              <div>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "56.25%", /* 16:9 */
                    background: "#000",
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    src={activeVideo.embed_url}
                    title={activeVideo.name}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                </div>
                <div style={{ marginTop: "0.6rem" }}>
                  <h3 style={{ fontSize: "1rem" }}>{activeVideo.name}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {activeVideo.type}
                    {activeVideo.runtime_seconds && ` · ${formatDuration(activeVideo.runtime_seconds)}`}
                    {activeVideo.width && ` · ${activeVideo.width}×${activeVideo.height}`}
                  </p>
                  {activeVideo.description && activeVideo.description !== activeVideo.name && (
                    <p style={{ fontSize: "0.88rem", marginTop: "0.3rem" }}>
                      {activeVideo.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Lista de vídeos */}
            {videos.length > 1 && (
              <div>
                <h4 style={{ marginBottom: "0.6rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Todos los vídeos ({videos.length})
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "0.6rem",
                    maxHeight: "30vh",
                    overflowY: "auto",
                  }}
                >
                  {videos.map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => setActiveVideo(vid)}
                      style={{
                        cursor: "pointer",
                        borderRadius: "var(--radius)",
                        overflow: "hidden",
                        border: `2px solid ${activeVideo?.id === vid.id ? "var(--primary)" : "var(--border)"}`,
                        background: "var(--surface-hover)",
                        transition: "border-color 0.2s",
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        {vid.thumbnail ? (
                          <img
                            src={vid.thumbnail}
                            alt={vid.name}
                            style={{
                              width: "100%",
                              height: "110px",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "110px",
                              background: "var(--surface)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "2rem",
                            }}
                          >
                            🎬
                          </div>
                        )}
                        {/* Play overlay */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(0,0,0,0.3)",
                            opacity: activeVideo?.id === vid.id ? 1 : 0,
                            transition: "opacity 0.2s",
                          }}
                        >
                          <span style={{ fontSize: "2rem" }}>▶</span>
                        </div>
                      </div>
                      <div style={{ padding: "0.4rem 0.6rem" }}>
                        <p
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {vid.name}
                        </p>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {vid.type}
                          {vid.runtime_seconds && ` · ${formatDuration(vid.runtime_seconds)}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
