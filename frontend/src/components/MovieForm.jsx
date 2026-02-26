import { useState, useEffect } from "react";

const EMPTY = {
  title: "",
  year: "",
  genre: "",
  director: "",
  plot: "",
  poster: "",
  imdb_id: "",
  imdb_rating: "",
};

export default function MovieForm({ movie, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (movie) {
      setForm({
        title: movie.title || "",
        year: movie.year ?? "",
        genre: movie.genre || "",
        director: movie.director || "",
        plot: movie.plot || "",
        poster: movie.poster || "",
        imdb_id: movie.imdb_id || "",
        imdb_rating: movie.imdb_rating ?? "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [movie]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      year: form.year ? parseInt(form.year, 10) : null,
      imdb_rating: form.imdb_rating ? parseFloat(form.imdb_rating) : null,
    };
    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{movie ? "Editar Película" : "Nueva Película"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título *</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Año</label>
            <input
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Género</label>
            <input name="genre" value={form.genre} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Director</label>
            <input name="director" value={form.director} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Sinopsis</label>
            <textarea
              name="plot"
              rows={3}
              value={form.plot}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>URL del Póster</label>
            <input name="poster" value={form.poster} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>IMDB ID</label>
            <input name="imdb_id" value={form.imdb_id} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>IMDB Rating</label>
            <input
              name="imdb_rating"
              type="number"
              step="0.1"
              value={form.imdb_rating}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {movie ? "Guardar Cambios" : "Crear Película"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
