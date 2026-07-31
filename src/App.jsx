import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./features/auth/components/Login";
import ListaSolicitudes from "./features/solicitudes/components/ListaSolicitudes";
import NuevaSolicitud from "./features/solicitudes/components/NuevaSolicitud";
import DetalleSolicitud from "./features/solicitudes/components/DetalleSolicitud";
import { useAuth } from "./features/auth/context/AuthContext";
import GestionTiposLicencia from "./features/tiposLicencia/components/GestionTiposLicencia";
import GestionUsuarios from "./features/usuarios/components/GestionUsuarios";
import Header from "./components/Header";

function Layout() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--upds-bg)' }}>
        <p style={{ fontWeight: 600, color: 'var(--upds-navy)' }}>Cargando sistema...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/solicitudes" /> : <Login />}
      />

      <Route element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/solicitudes" element={<ListaSolicitudes />} />
        <Route path="/solicitudes/nueva" element={<NuevaSolicitud />} />
        <Route path="/solicitudes/:id" element={<DetalleSolicitud />} />
        <Route
          path="/tipos-licencia"
          element={
            user?.role === "administrador" ? (
              <GestionTiposLicencia />
            ) : (
              <Navigate to="/solicitudes" />
            )
          }
        />
        <Route
          path="/usuarios"
          element={
            user?.role === "administrador" ? (
              <GestionUsuarios />
            ) : (
              <Navigate to="/solicitudes" />
            )
          }
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to={user ? "/solicitudes" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
