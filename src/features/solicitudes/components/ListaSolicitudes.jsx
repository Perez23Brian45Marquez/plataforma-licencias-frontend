import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { useSolicitudes } from "../hooks/useSolicitudes";

const ESTADO_BADGES = {
  pendiente: { label: "PENDIENTE", className: "status-badge-pendiente" },
  en_revision: { label: "EN REVISION", className: "status-badge-en_revision" },
  aprobada: { label: "APROBADA", className: "status-badge-aprobada" },
  rechazada: { label: "RECHAZADA", className: "status-badge-rechazada" },
};

export default function ListaSolicitudes() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [qActivo, setQActivo] = useState("");

  const { solicitudes, meta, loading, error } = useSolicitudes(
    page,
    qActivo,
    estadoFiltro
  );

  const buscar = (e) => {
    e.preventDefault();
    setPage(1);
    setQActivo(busqueda);
  };

  return (
    <div>
      {/* Top action bar & title */}
      <div className="upds-card upds-card-accent" style={{ marginBottom: "20px", padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--upds-navy)", margin: 0 }}>
              Solicitudes de Licencia
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--upds-text-muted)", marginTop: "4px" }}>
              {user.role === "estudiante" && "Consulta y crea tus solicitudes de licencias académicas."}
              {user.role === "revisor" && "Solicitudes asignadas a tus tipos de licencia."}
              {user.role === "administrador" && "Panel global de administración de solicitudes."}
            </p>
          </div>

          <div>
            {user.role === "estudiante" && (
              <Link to="/solicitudes/nueva" className="upds-btn upds-btn-primary">
                + Nueva Solicitud
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="upds-card" style={{ padding: "16px 24px", marginBottom: "20px" }}>
        <form onSubmit={buscar} style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1", minWidth: "240px" }}>
            <input
              className="upds-input"
              placeholder="Buscar por ID, nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div style={{ width: "180px" }}>
            <select
              className="upds-select"
              value={estadoFiltro}
              onChange={(e) => {
                setEstadoFiltro(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_revision">En revisión</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>

          <button type="submit" className="upds-btn upds-btn-primary">
            Buscar
          </button>
        </form>
      </div>

      {error && <div className="upds-alert upds-alert-danger">{error}</div>}

      {/* Requests Table */}
      <div className="upds-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--upds-navy)", fontWeight: 600 }}>
            Cargando solicitudes...
          </div>
        ) : (
          <div className="upds-table-container">
            <table className="upds-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo de Licencia</th>
                  <th>Estudiante</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--upds-text-muted)" }}>
                      No se encontraron solicitudes.
                    </td>
                  </tr>
                ) : (
                  solicitudes.map((s) => {
                    const badge = ESTADO_BADGES[s.estado] || { label: s.estado, className: "" };
                    return (
                      <tr key={s.id}>
                        <td><strong>#{s.id}</strong></td>
                        <td>{s.tipo_licencia?.nombre || "—"}</td>
                        <td>
                          <div>
                            <span style={{ fontWeight: 600, display: "block" }}>{s.estudiante?.name || "—"}</span>
                            {s.estudiante?.email && (
                              <span style={{ fontSize: "0.8rem", color: "var(--upds-text-muted)" }}>{s.estudiante.email}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td>{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                        <td style={{ textAlign: "right" }}>
                          <Link
                            to={`/solicitudes/${s.id}`}
                            className="upds-btn upds-btn-outline"
                            style={{ padding: "5px 12px", fontSize: "0.85rem" }}
                          >
                            Ver Detalle
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.lastPage > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: "1px solid var(--upds-border)" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--upds-text-muted)" }}>
              Página <strong>{meta.currentPage}</strong> de <strong>{meta.lastPage}</strong> ({meta.total} registros)
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="upds-btn upds-btn-outline"
                style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </button>
              <button
                className="upds-btn upds-btn-outline"
                style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                disabled={page >= meta.lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
