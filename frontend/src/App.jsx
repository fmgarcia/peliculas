import { Routes, Route, NavLink } from "react-router-dom";
import MoviesPage from "./pages/MoviesPage";
import ListsPage from "./pages/ListsPage";
import ImportPage from "./pages/ImportPage";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Gestor de Películas</h1>
        <nav>
          <NavLink to="/" end>
            Películas
          </NavLink>
          <NavLink to="/lists">Listas</NavLink>
          <NavLink to="/import">Importar IMDB</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<MoviesPage />} />
          <Route path="/lists" element={<ListsPage />} />
          <Route path="/import" element={<ImportPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
