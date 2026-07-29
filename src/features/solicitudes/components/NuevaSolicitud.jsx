import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../components/api/axios';
import { solicitudesApi } from '../api/solicitudesApi';

export default function NuevaSolicitud() {
  const [tipos, setTipos] = useState([]);
  const [tipoLicenciaId, setTipoLicenciaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tipos-licencia').then((res) => setTipos(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await solicitudesApi.crear(tipoLicenciaId);
      navigate('/solicitudes');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo crear la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto' }}>
      <Link to="/solicitudes">← Volver</Link>
      <h2>Nueva solicitud</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Tipo de licencia</label>
        <br />
        <select
          value={tipoLicenciaId}
          onChange={(e) => setTipoLicenciaId(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 12 }}
        >
          <option value="">Selecciona un tipo</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre} ({t.dias_estimados} días estimados)
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading || !tipoLicenciaId}>
          {loading ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </form>
    </div>
  );
}