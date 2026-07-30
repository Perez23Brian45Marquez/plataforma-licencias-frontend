import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/components/Login";
import ListaSolicitudes from "./features/solicitudes/components/ListaSolicitudes";
import NuevaSolicitud from "./features/solicitudes/components/NuevaSolicitud";
import DetalleSolicitud from "./features/solicitudes/components/DetalleSolicitud";
import { useAuth } from "./features/auth/context/AuthContext";
import GestionTiposLicencia from "./features/tiposLicencia/components/GestionTiposLicencia";
import GestionUsuarios from "./features/usuarios/components/GestionUsuarios";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/solicitudes" /> : <Login />}
      />
      <Route
        path="/solicitudes"
        element={user ? <ListaSolicitudes /> : <Navigate to="/login" />}
      />
      <Route
        path="/solicitudes/nueva"
        element={user ? <NuevaSolicitud /> : <Navigate to="/login" />}
      />
      <Route
        path="/solicitudes/:id"
        element={user ? <DetalleSolicitud /> : <Navigate to="/login" />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? "/solicitudes" : "/login"} />}
      />
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
    </Routes>
  );
}

export default App;
