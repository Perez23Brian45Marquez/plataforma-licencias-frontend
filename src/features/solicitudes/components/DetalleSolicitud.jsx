import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { solicitudesApi } from '../api/solicitudesApi';

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

  const cambiarEstado = async (estado) => {
    if (estado === 'rechazada' && !motivoRechazo.trim()) {
      setError('Debes indicar un motivo de rechazo.');
      return;
    }
    setActualizando(true);
    setError('');
    try {
      await solicitudesApi.actualizarEstado(id, estado, motivoRechazo || null);
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

  if (loading) return <p>Cargando...</p>;
  if (error && !solicitud) return <p style={{ color: 'red' }}>{error}</p>;
  if (!solicitud) return null;

  const puedeRevisar = ['revisor', 'administrador'].includes(user.role);
  const puedeCancelar =
    user.role === 'estudiante' && solicitud.user_id === user.id && solicitud.estado === 'pendiente';

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <Link to="/solicitudes">← Volver</Link>
      <h2>Solicitud #{solicitud.id}</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p><strong>Tipo:</strong> {solicitud.tipo_licencia?.nombre}</p>
      <p><strong>Estudiante:</strong> {solicitud.estudiante?.name}</p>
      <p><strong>Revisor:</strong> {solicitud.revisor?.name ?? 'Sin asignar'}</p>
      <p><strong>Estado:</strong> {solicitud.estado}</p>
      <p><strong>Fecha de solicitud:</strong> {new Date(solicitud.fecha_solicitud).toLocaleString()}</p>
      {solicitud.motivo_rechazo && <p><strong>Motivo de rechazo:</strong> {solicitud.motivo_rechazo}</p>}

      {puedeRevisar && solicitud.estado === 'pendiente' && (
        <button disabled={actualizando} onClick={() => cambiarEstado('en_revision')}>
          Tomar para revisión
        </button>
      )}

      {puedeRevisar && solicitud.estado === 'en_revision' && (
        <div style={{ marginTop: 12 }}>
          <button disabled={actualizando} onClick={() => cambiarEstado('aprobada')}>
            Aprobar
          </button>
          <div style={{ marginTop: 8 }}>
            <input
              placeholder="Motivo de rechazo"
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
            />
            <button disabled={actualizando} onClick={() => cambiarEstado('rechazada')}>
              Rechazar
            </button>
          </div>
        </div>
      )}

      {puedeCancelar && (
        <button onClick={cancelar} style={{ marginTop: 12 }}>
          Cancelar solicitud
        </button>
      )}

      <h3 style={{ marginTop: 24 }}>Historial</h3>
      <ul>
        {historial.map((h) => (
          <li key={h.id}>
            {h.estado_anterior ?? '—'} → {h.estado_nuevo} por {h.usuario?.name} el{' '}
            {new Date(h.created_at).toLocaleString()}
            {h.comentario && ` — "${h.comentario}"`}
          </li>
        ))}
      </ul>
    </div>
  );
}