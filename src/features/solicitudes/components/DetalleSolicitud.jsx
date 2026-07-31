import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { solicitudesApi } from '../api/solicitudesApi';
import api from '../../../components/api/axios';

const ESTADO_BADGES = {
  pendiente: { label: 'PENDIENTE', className: 'status-badge-pendiente' },
  en_revision: { label: 'EN REVISION', className: 'status-badge-en_revision' },
  aprobada: { label: 'APROBADA', className: 'status-badge-aprobada' },
  rechazada: { label: 'RECHAZADA', className: 'status-badge-rechazada' },
};

export default function DetalleSolicitud() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [actualizando, setActualizando] = useState(false);
  const [descargandoId, setDescargandoId] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [resSolicitud, resHistorial] = await Promise.all([
        solicitudesApi.obtener(id),
        solicitudesApi.historial(id),
      ]);
      setSolicitud(resSolicitud.data);
      setHistorial(resHistorial.data);
    } catch (err) {
      setError('No se pudo cargar la solicitud.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiarEstado = async (nuevoEstado) => {
    if (nuevoEstado === 'rechazada' && !motivoRechazo.trim()) {
      setError('Debes indicar un motivo de rechazo para rechazar la solicitud.');
      return;
    }
    setActualizando(true);
    setError('');
    try {
      await solicitudesApi.actualizarEstado(id, nuevoEstado, motivoRechazo.trim() || null);
      await cargar();
      setMotivoRechazo('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el estado.');
    } finally {
      setActualizando(false);
    }
  };

  const cancelar = async () => {
    if (!confirm('¿Cancelar esta solicitud?')) return;
    try {
      await solicitudesApi.eliminar(id);
      navigate('/solicitudes');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cancelar.');
    }
  };

  const descargarArchivo = async (justificativoId, nombreArchivo) => {
    setDescargandoId(justificativoId);
    try {
      const response = await api.get(`/justificativos/${justificativoId}/descargar`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo || `justificativo_${justificativoId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback direct endpoint link open
      window.open(`http://127.0.0.1:8000/api/justificativos/${justificativoId}/descargar`, '_blank');
    } finally {
      setDescargandoId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ fontWeight: 600, color: 'var(--upds-navy)' }}>Cargando detalle de la solicitud...</p>
      </div>
    );
  }

  if (error && !solicitud) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Link to="/solicitudes" className="upds-back-link">← Volver a solicitudes</Link>
        <div className="upds-alert upds-alert-danger">{error}</div>
      </div>
    );
  }

  if (!solicitud) return null;

  const esRevisorOAdmin = ['revisor', 'administrador'].includes(user.role);
  const puedeCancelar =
    user.role === 'estudiante' && solicitud.user_id === user.id && solicitud.estado === 'pendiente';

  const badgeInfo = ESTADO_BADGES[solicitud.estado] || { label: solicitud.estado, className: '' };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/solicitudes" className="upds-back-link">
        ← Volver a solicitudes
      </Link>

      <div className="upds-card upds-card-accent">
        <div className="upds-card-header">
          <div>
            <h2 className="upds-card-title" style={{ margin: 0 }}>
              Solicitud #{solicitud.id}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--upds-text-muted)' }}>
              Registrada el {new Date(solicitud.fecha_solicitud).toLocaleString()}
            </span>
          </div>
          <div>
            <span className={`status-badge ${badgeInfo.className}`}>
              {badgeInfo.label}
            </span>
          </div>
        </div>

        {error && <div className="upds-alert upds-alert-danger">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--upds-text-muted)', display: 'block', fontWeight: 600 }}>TIPO DE LICENCIA</span>
            <span style={{ fontWeight: 600, color: 'var(--upds-navy)', fontSize: '1rem' }}>
              {solicitud.tipo_licencia?.nombre || 'N/A'}
            </span>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--upds-text-muted)', display: 'block', fontWeight: 600 }}>ESTUDIANTE</span>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {solicitud.estudiante?.name || 'N/A'}
            </span>
            {solicitud.estudiante?.email && (
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--upds-text-muted)' }}>
                {solicitud.estudiante.email}
              </span>
            )}
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--upds-text-muted)', display: 'block', fontWeight: 600 }}>REVISOR ASIGNADO</span>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {solicitud.revisor?.name ?? 'Sin asignar'}
            </span>
          </div>
        </div>

        {solicitud.motivo_rechazo && (
          <div style={{ background: '#fff5f5', borderLeft: '4px solid var(--btn-danger)', padding: '14px 16px', borderRadius: '4px', marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--btn-danger)', fontSize: '0.9rem', marginBottom: '4px' }}>Motivo de Rechazo:</h4>
            <p style={{ fontSize: '0.95rem', color: '#2c3e50' }}>{solicitud.motivo_rechazo}</p>
          </div>
        )}

        {/* Action Panel for Revisor / Admin */}
        {esRevisorOAdmin && (
          <div style={{ backgroundColor: '#f4f6f9', border: '1px solid var(--upds-border)', borderRadius: '6px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--upds-navy)', marginBottom: '12px' }}>
              Acciones de Revisión de Estado
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                className="upds-btn"
                style={{ backgroundColor: 'var(--badge-pendiente-bg)', color: 'var(--badge-pendiente-text)' }}
                disabled={actualizando || solicitud.estado === 'pendiente'}
                onClick={() => cambiarEstado('pendiente')}
              >
                PENDIENTE
              </button>

              <button
                type="button"
                className="upds-btn"
                style={{ backgroundColor: 'var(--badge-revision-bg)', color: 'var(--badge-revision-text)' }}
                disabled={actualizando || solicitud.estado === 'en_revision'}
                onClick={() => cambiarEstado('en_revision')}
              >
                EN REVISION
              </button>

              <button
                type="button"
                className="upds-btn upds-btn-success"
                disabled={actualizando || solicitud.estado === 'aprobada'}
                onClick={() => cambiarEstado('aprobada')}
              >
                APROBADA
              </button>

              <button
                type="button"
                className="upds-btn upds-btn-danger"
                disabled={actualizando || solicitud.estado === 'rechazada'}
                onClick={() => cambiarEstado('rechazada')}
              >
                RECHAZADA
              </button>
            </div>

            {/* Motivo de rechazo input field */}
            <div style={{ marginTop: '12px' }}>
              <label className="upds-label">
                Motivo de Rechazo <span style={{ color: 'var(--btn-danger)', fontWeight: 400 }}>(Requerido para rechazar)</span>
              </label>
              <textarea
                className="upds-textarea"
                rows="2"
                placeholder="Escribe la razón del rechazo..."
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Student Cancel Option */}
        {puedeCancelar && (
          <div style={{ marginBottom: '24px' }}>
            <button onClick={cancelar} className="upds-btn upds-btn-danger">
              Cancelar Solicitud
            </button>
          </div>
        )}

        {/* Documentos Justificativos Section */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--upds-navy)', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
            Documentos Justificativos
          </h3>

          {solicitud.justificativos?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {solicitud.justificativos.map((j) => (
                <div
                  key={j.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    border: '1px solid var(--upds-border)',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--upds-navy)" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <div>
                      <span style={{ fontWeight: 600, display: 'block', fontSize: '0.95rem' }}>
                        {j.nombre_archivo}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--upds-text-muted)' }}>
                        {(j.tamano / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="upds-btn upds-btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                      disabled={descargandoId === j.id}
                      onClick={() => descargarArchivo(j.id, j.nombre_archivo)}
                    >
                      {descargandoId === j.id ? 'Descargando...' : 'Ver / Descargar'}
                    </button>
                    <a
                      href={`http://127.0.0.1:8000/api/justificativos/${j.id}/descargar`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="upds-btn upds-btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                      Enlace Directo
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--upds-text-muted)', fontStyle: 'italic' }}>
              Sin documentos adjuntos.
            </p>
          )}
        </div>

        {/* Historial Section */}
        <div style={{ marginTop: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--upds-navy)', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
            Historial de Cambios
          </h3>
          {historial.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {historial.map((h) => (
                <li
                  key={h.id}
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '0.9rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>
                      <strong>{h.usuario?.name || 'Usuario'}</strong> cambió el estado de{' '}
                      <span className="status-badge" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>{h.estado_anterior || 'Inicio'}</span>
                      {' → '}
                      <span className="status-badge" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>{h.estado_nuevo}</span>
                    </span>
                    <span style={{ color: 'var(--upds-text-muted)', fontSize: '0.8rem' }}>
                      {new Date(h.created_at).toLocaleString()}
                    </span>
                  </div>
                  {h.comentario && (
                    <p style={{ color: 'var(--upds-text-muted)', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '2px' }}>
                      "{h.comentario}"
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--upds-text-muted)', fontStyle: 'italic' }}>
              Sin registros en el historial.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}