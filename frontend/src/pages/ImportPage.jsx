import { useState } from "react";
import { searchIMDB, importMovies } from "../services/api";

export default function ImportPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setSelected(new Set());
    setImportedCount(null);
    try {
      const data = await searchIMDB(query.trim());
      setResults(data);
    } catch (err) {
      alert(`Error buscando: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (imdbId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(imdbId)) next.delete(imdbId);
      else next.add(imdbId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map((r) => r.imdb_id)));
    }
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    setImportedCount(null);
    try {
      const imported = await importMovies([...selected]);
      setImportedCount(imported.length);
      setSelected(new Set());
    } catch (err) {
      alert(`Error importando: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <div className="toolbar">
        <h2>Importar desde IMDB</h2>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Buscar en IMDB (ej: Inception, Matrix…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : "🔍 Buscar"}
        </button>
      </form>

      {importedCount !== null && (
        <div
          style={{
            padding: "0.8rem 1.2rem",
            background: "#1b5e20",
            borderRadius: "var(--radius)",
            marginBottom: "1rem",
          }}
        >
          ✅ {importedCount} película(s) importada(s) correctamente.
        </div>
      )}

      {results.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div className="checkbox-row">
              <input
                type="checkbox"
                checked={selected.size === results.length}
                onChange={toggleAll}
              />
              <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                Seleccionar todo ({selected.size}/{results.length})
              </span>
            </div>
            <button
              className="btn btn-primary"
              disabled={selected.size === 0 || importing}
              onClick={handleImport}
            >
              {importing ? (
                <>
                  <span className="spinner" /> Importando…
                </>
              ) : (
                `📥 Importar ${selected.size} seleccionada(s)`
              )}
            </button>
          </div>

          <div>
            {results.map((r) => (
              <div key={r.imdb_id} className="card imdb-result" style={{ marginBottom: "0.5rem" }}>
                <input
                  type="checkbox"
                  checked={selected.has(r.imdb_id)}
                  onChange={() => toggleSelect(r.imdb_id)}
                />
                {r.poster ? (
                  <img src={r.poster} alt={r.title} />
                ) : (
                  <div
                    style={{
                      width: 50,
                      height: 72,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--surface-hover)",
                      borderRadius: 4,
                      fontSize: "1.4rem",
                    }}
                  >
                    🎬
                  </div>
                )}
                <div className="info">
                  <h4>{r.title}</h4>
                  <span>
                    {r.year && `${r.year} · `}
                    {r.type || "movie"} · {r.imdb_id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && results.length === 0 && (
        <div className="empty-state">
          <span>🔎</span>
          <p>Busca películas en IMDB para importarlas a tu catálogo.</p>
        </div>
      )}
    </>
  );
}
