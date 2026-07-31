import { useState, useEffect } from 'react';
import { tiposLicenciaApi } from '../api/tiposLicenciaApi';

export default function GestionTiposLicencia() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', dias_estimados: '' });

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await tiposLicenciaApi.listar();
      setTipos(res.data);
    } catch (err) {
      setError('No se pudieron cargar los tipos de licencia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirFormulario = (tipo = null) => {
    setEditando(tipo?.id ?? 'nuevo');
    setForm(
      tipo
        ? { nombre: tipo.nombre, descripcion: tipo.descripcion ?? '', dias_estimados: tipo.dias_estimados }
        : { nombre: '', descripcion: '', dias_estimados: '' }
    );
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editando === 'nuevo') {
        await tiposLicenciaApi.crear(form);
      } else {
        await tiposLicenciaApi.actualizar(editando, form);
      }
      setEditando(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar.');
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este tipo de licencia?')) return;
    try {
      await tiposLicenciaApi.eliminar(id);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar.');
    }
  };

  return (
    <div>
      <div className="upds-card upds-card-accent" style={{ marginBottom: '20px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--upds-navy)', margin: '0 0 4px' }}>
              Gestión de Tipos de Licencia
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--upds-text-muted)' }}>
              Configura los tipos de licencia disponibles y sus días estimados de procesamiento.
            </p>
          </div>

          <button onClick={() => abrirFormulario()} className="upds-btn upds-btn-success">
            + Nuevo Tipo de Licencia
          </button>
        </div>
      </div>

      {error && <div className="upds-alert upds-alert-danger">{error}</div>}

      {/* Form Card */}
      {editando && (
        <div className="upds-card upds-card-accent" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--upds-navy)', marginBottom: '16px' }}>
            {editando === 'nuevo' ? 'Nuevo Tipo de Licencia' : 'Editar Tipo de Licencia'}
          </h3>

          <form onSubmit={guardar}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="upds-form-group">
                <label className="upds-label">Nombre *</label>
                <input
                  className="upds-input"
                  placeholder="Ej. Salud, Trabajo..."
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="upds-form-group">
                <label className="upds-label">Días Estimados *</label>
                <input
                  type="number"
                  className="upds-input"
                  placeholder="Ej. 3"
                  value={form.dias_estimados}
                  onChange={(e) => setForm({ ...form, dias_estimados: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="upds-form-group">
              <label className="upds-label">Descripción</label>
              <textarea
                className="upds-textarea"
                rows="2"
                placeholder="Descripción del tipo de licencia..."
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="upds-btn upds-btn-secondary"
                onClick={() => setEditando(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="upds-btn upds-btn-primary">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="upds-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--upds-navy)', fontWeight: 600 }}>
            Cargando tipos de licencia...
          </div>
        ) : (
          <div className="upds-table-container">
            <table className="upds-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Días Estimados</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tipos.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--upds-text-muted)' }}>
                      No hay tipos de licencia registrados.
                    </td>
                  </tr>
                ) : (
                  tipos.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.nombre}</td>
                      <td>{t.descripcion || <span style={{ color: 'var(--upds-text-muted)', fontStyle: 'italic' }}>Sin descripción</span>}</td>
                      <td>
                        <span style={{ background: '#e9ecef', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                          {t.dias_estimados} días
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => abrirFormulario(t)}
                            className="upds-btn upds-btn-outline"
                            style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminar(t.id)}
                            className="upds-btn upds-btn-danger"
                            style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}