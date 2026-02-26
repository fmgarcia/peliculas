import { useState, useEffect } from "react";

export default function ListForm({ list, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (list) {
      setName(list.name || "");
      setDescription(list.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [list]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, description });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{list ? "Editar Lista" : "Nueva Lista"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {list ? "Guardar Cambios" : "Crear Lista"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
