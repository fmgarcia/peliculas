# 🎬 Gestor de Películas

Aplicación web completa para gestionar tu catálogo de películas con importación desde IMDB.

## Arquitectura

| Componente | Tecnología |
|-----------|-----------|
| **Backend** | Python + FastAPI |
| **Frontend** | React + Vite |
| **Persistencia** | Ficheros JSON (sin base de datos) |
| **Contenedores** | Docker + Docker Compose |

## Estructura del Proyecto

```
peliculas/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # Entrada FastAPI
│       ├── models/schemas.py    # Modelos Pydantic
│       ├── routers/
│       │   ├── movies.py        # CRUD películas
│       │   ├── lists.py         # CRUD listas
│       │   └── imdb.py          # Búsqueda e importación IMDB
│       └── services/
│           ├── storage.py       # Persistencia JSON
│           └── imdb_client.py   # Cliente IMDB API
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── services/api.js
│       ├── components/
│       │   ├── MovieCard.jsx
│       │   ├── MovieForm.jsx
│       │   └── ListForm.jsx
│       └── pages/
│           ├── MoviesPage.jsx
│           ├── ListsPage.jsx
│           └── ImportPage.jsx
```

## Inicio Rápido

### Con Docker (recomendado)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Docs Swagger: http://localhost:8000/docs

### Desarrollo Local (sin Docker)

**Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Persistencia

Los datos se guardan en `backend/data/` como ficheros JSON:
- `movies.json` — Catálogo de películas
- `lists.json` — Listas personalizadas

En Docker, el volumen `peliculas-data` garantiza que los datos persisten entre reinicios de contenedores.

## Despliegue con Dokploy

1. Sube el repositorio a GitHub
2. En Dokploy, crea un proyecto apuntando al repo
3. Dokploy detectará el `docker-compose.yml` y desplegará ambos servicios
4. El volumen `peliculas-data` mantiene los datos entre despliegues

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/movies/` | Listar películas |
| POST | `/api/movies/` | Crear película |
| GET | `/api/movies/{id}` | Obtener película |
| PUT | `/api/movies/{id}` | Actualizar película |
| DELETE | `/api/movies/{id}` | Eliminar película |
| GET | `/api/lists/` | Listar listas |
| POST | `/api/lists/` | Crear lista |
| PUT | `/api/lists/{id}` | Actualizar lista |
| DELETE | `/api/lists/{id}` | Eliminar lista |
| POST | `/api/lists/{id}/movies/{movieId}` | Añadir película a lista |
| DELETE | `/api/lists/{id}/movies/{movieId}` | Quitar película de lista |
| GET | `/api/lists/{id}/movies` | Películas de una lista |
| GET | `/api/imdb/search?query=...` | Buscar en IMDB |
| POST | `/api/imdb/import` | Importar masivo desde IMDB |
