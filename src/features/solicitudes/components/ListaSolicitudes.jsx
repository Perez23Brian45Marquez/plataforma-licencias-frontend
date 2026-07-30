import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { useSolicitudes } from "../hooks/useSolicitudes";

const ESTADO_LABELS = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

export default function ListaSolicitudes() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [qActivo, setQActivo] = useState("");
  const { solicitudes, meta, loading, error, recargar } = useSolicitudes(
    page,
    qActivo,
    estadoFiltro,
  );

  const buscar = (e) => {
    e.preventDefault();
    setPage(1);
    setQActivo(busqueda);
  };

  if (loading) return <p>Cargando solicitudes...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Solicitudes ({meta?.total ?? 0})</h2>
        <div>
          <span style={{ marginRight: 12 }}>
            {user.name} — {user.role}
          </span>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      {user.role === "estudiante" && (
        <Link to="/solicitudes/nueva">
          <button style={{ marginBottom: 16 }}>+ Nueva solicitud</button>
        </Link>
      )}
      {user.role === "administrador" && (
        <>
          <Link to="/tipos-licencia" style={{ marginRight: 12 }}>
            Gestionar tipos de licencia
          </Link>
          <Link to="/usuarios" style={{ marginRight: 12 }}>
            Gestionar usuarios
          </Link>
        </>
      )}
      <form onSubmit={buscar} style={{ margin: "12px 0" }}>
        <input
          placeholder="Buscar por ID, nombre o email del estudiante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: 260, marginRight: 8 }}
        />
        <select
          value={estadoFiltro}
          onChange={(e) => {
            setEstadoFiltro(e.target.value);
            setPage(1);
          }}
          style={{ marginRight: 8 }}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_revision">En revisión</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
        <button type="submit">Buscar</button>
      </form>
      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo de licencia</th>
            <th>Estudiante</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No hay solicitudes.
              </td>
            </tr>
          )}
          {solicitudes.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.tipo_licencia?.nombre}</td>
              <td>{s.estudiante?.name}</td>
              <td>{ESTADO_LABELS[s.estado]}</td>
              <td>{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
              <td>
                <Link to={`/solicitudes/${s.id}`}>Ver detalle</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {meta && meta.lastPage > 1 && (
        <div style={{ marginTop: 16 }}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </button>
          <span style={{ margin: "0 12px" }}>
            Página {meta.currentPage} de {meta.lastPage}
          </span>
          <button
            disabled={page >= meta.lastPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
