import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../components/api/axios';
import { solicitudesApi } from '../api/solicitudesApi';

export default function NuevaSolicitud() {
  const [tipos, setTipos] = useState([]);
  const [tipoLicenciaId, setTipoLicenciaId] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tipos-licencia').then((res) => setTipos(res.data));
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
      setError('');
    } else {
      setArchivo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!archivo) {
      setError('Debes adjuntar un documento justificativo para poder enviar la solicitud.');
      return;
    }

    if (!tipoLicenciaId) {
      setError('Debes seleccionar un tipo de licencia.');
      return;
    }

    setLoading(true);
    try {
      await solicitudesApi.crear(tipoLicenciaId, archivo);
      navigate('/solicitudes');
    } catch (err) {
      const errores = err.response?.data?.errors;
      const primerError = errores ? Object.values(errores)[0][0] : null;
      setError(primerError || err.response?.data?.message || 'No se pudo crear la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Boolean(tipoLicenciaId) && Boolean(archivo);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Link to="/solicitudes" className="upds-back-link">
        ← Volver a solicitudes
      </Link>

      <div className="upds-card upds-card-accent">
        <div className="upds-card-header">
          <h2 className="upds-card-title">Nueva Solicitud de Licencia</h2>
        </div>

        {error && (
          <div className="upds-alert upds-alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="upds-form-group">
            <label className="upds-label">Tipo de Licencia *</label>
            <select
              className="upds-select"
              value={tipoLicenciaId}
              onChange={(e) => setTipoLicenciaId(e.target.value)}
              required
            >
              <option value="">-- Selecciona un tipo de licencia --</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} ({t.dias_estimados} días estimados)
                </option>
              ))}
            </select>
          </div>

          <div className="upds-form-group">
            <label className="upds-label">
              Documento Justificativo * <span style={{ fontWeight: 400, color: 'var(--upds-text-muted)', fontSize: '0.85rem' }}>(PDF o Imagen, máx. 5MB)</span>
            </label>
            <input
              type="file"
              className="upds-file-input"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              required
            />
            {archivo && (
              <p style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--btn-success)', fontWeight: 600 }}>
                ✓ Archivo seleccionado: {archivo.name} ({(archivo.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px' }}>
            <Link to="/solicitudes" className="upds-btn upds-btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              className="upds-btn upds-btn-primary"
              disabled={loading || !isFormValid}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}