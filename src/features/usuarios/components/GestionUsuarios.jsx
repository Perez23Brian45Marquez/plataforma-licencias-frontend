import { useState, useEffect, useCallback } from 'react';
import { usuariosApi } from '../api/usuariosApi';
import { tiposLicenciaApi } from '../../tiposLicencia/api/tiposLicenciaApi';

const ROLES = [
  { value: 'estudiante', label: 'Estudiantes' },
  { value: 'revisor', label: 'Revisores' },
  { value: 'administrador', label: 'Administradores' },
];

export default function GestionUsuarios() {
  const [rolActivo, setRolActivo] = useState('estudiante');
  const [usuarios, setUsuarios] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', tipo_licencia_ids: [] });
  const [errorForm, setErrorForm] = useState('');

  const [editandoId, setEditandoId] = useState(null);
  const [editandoRole, setEditandoRole] = useState('estudiante');

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [resUsuarios, resTipos] = await Promise.all([
        usuariosApi.listar(rolActivo, page, busqueda),
        tiposLicenciaApi.listar(),
      ]);
      setUsuarios(resUsuarios.data.data);
      setMeta({
        currentPage: resUsuarios.data.current_page,
        lastPage: resUsuarios.data.last_page,
        total: resUsuarios.data.total
      });
      setTipos(resTipos.data);
    } catch (_err) {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, [rolActivo, page, busqueda]);

  useEffect(() => { cargar(); }, [cargar]);

  const buscar = (e) => {
    e.preventDefault();
    setPage(1);
    cargar();
  };

  const cambiarPestana = (rol) => {
    setRolActivo(rol);
    setPage(1);
    setBusqueda('');
    setMostrarForm(false);
  };

  const toggleTipoForm = (tipoId) => {
    setForm((prev) => {
      const actuales = prev.tipo_licencia_ids;
      const yaEsta = actuales.includes(tipoId);
      return { ...prev, tipo_licencia_ids: yaEsta ? actuales.filter((id) => id !== tipoId) : [...actuales, tipoId] };
    });
  };

  const abrirEdicion = (u) => {
    setEditandoId(u.id);
    setEditandoRole(u.role);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      tipo_licencia_ids: (u.tipos_licencia_asignados || []).map((t) => t.id),
    });
    setMostrarForm(true);
  };

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm({ name: '', email: '', password: '', tipo_licencia_ids: [] });
    setMostrarForm(true);
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setErrorForm('');
    try {
      if (editandoId) {
        const payload = { name: form.name, email: form.email };
        if (form.password) payload.password = form.password;
        await usuariosApi.actualizar(editandoId, payload);
        if (editandoRole === 'revisor') {
          await usuariosApi.asignarTipos(editandoId, form.tipo_licencia_ids);
        }
      } else {
        const payload = { name: form.name, email: form.email, password: form.password, role: rolActivo };
        if (rolActivo === 'revisor') payload.tipo_licencia_ids = form.tipo_licencia_ids;
        await usuariosApi.crear(payload);
      }
      setMostrarForm(false);
      setEditandoId(null);
      setPage(1);
      await cargar();
    } catch (err) {
      const errores = err.response?.data?.errors;
      const primerError = errores ? Object.values(errores)[0][0] : null;
      setErrorForm(primerError || err.response?.data?.message || 'No se pudo guardar.');
    }
  };

  const eliminarUsuario = async (id) => {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    setError('');
    try {
      await usuariosApi.eliminar(id);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar.');
    }
  };

  const rolLabelSingular = ROLES.find((r) => r.value === (editandoId ? editandoRole : rolActivo))?.label.replace(/es$/, 'e').replace(/s$/, '');

  return (
    <div>
      <div className="upds-card upds-card-accent" style={{ marginBottom: '20px', padding: '20px 24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--upds-navy)', margin: '0 0 4px' }}>
          Gestión de Usuarios
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--upds-text-muted)' }}>
          Administración de cuentas y asignación de permisos para tipos de licencia.
        </p>

        {/* Role Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderBottom: '1px solid var(--upds-border)', paddingBottom: '12px' }}>
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => cambiarPestana(r.value)}
              className={`upds-btn ${rolActivo === r.value ? 'upds-btn-primary' : 'upds-btn-outline'}`}
              style={{ fontSize: '0.9rem', padding: '7px 16px' }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="upds-alert upds-alert-danger">{error}</div>}

      {/* Action and Search Header */}
      <div className="upds-card" style={{ padding: '16px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <button onClick={abrirNuevo} className="upds-btn upds-btn-success">
            + Nuevo {rolLabelSingular}
          </button>

          <form onSubmit={buscar} style={{ display: 'flex', gap: '8px' }}>
            <input
              className="upds-input"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: '240px' }}
            />
            <button type="submit" className="upds-btn upds-btn-primary">
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* User Create / Edit Form Card */}
      {mostrarForm && (
        <div className="upds-card upds-card-accent" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--upds-navy)', marginBottom: '16px' }}>
            {editandoId ? `Editar ${rolLabelSingular}` : `Crear Nuevo ${rolLabelSingular}`}
          </h3>

          {errorForm && <div className="upds-alert upds-alert-danger">{errorForm}</div>}

          <form onSubmit={guardarUsuario}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="upds-form-group">
                <label className="upds-label">Nombre Completo *</label>
                <input
                  className="upds-input"
                  placeholder="Ej. Juan Pérez"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="upds-form-group">
                <label className="upds-label">Correo Electrónico *</label>
                <input
                  type="email"
                  className="upds-input"
                  placeholder="ejemplo@upds.edu.bo"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="upds-form-group">
                <label className="upds-label">Contraseña {editandoId && '(Dejar en blanco para no cambiar)'}</label>
                <input
                  type="password"
                  className="upds-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editandoId}
                />
              </div>
            </div>

            {/* License Type assignment checkboxes for Reviewers */}
            {(editandoId ? editandoRole : rolActivo) === 'revisor' && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid var(--upds-border)', marginBottom: '20px' }}>
                <label className="upds-label" style={{ marginBottom: '8px' }}>
                  Tipos de Licencia que puede Revisar:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                  {tipos.map((t) => (
                    <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={form.tipo_licencia_ids.includes(t.id)}
                        onChange={() => toggleTipoForm(t.id)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--upds-navy)' }}
                      />
                      <span>{t.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="upds-btn upds-btn-secondary"
                onClick={() => { setMostrarForm(false); setEditandoId(null); }}
              >
                Cancelar
              </button>
              <button type="submit" className="upds-btn upds-btn-primary">
                {editandoId ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="upds-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--upds-navy)', fontWeight: 600 }}>
            Cargando usuarios...
          </div>
        ) : (
          <div className="upds-table-container">
            <table className="upds-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  {rolActivo === 'estudiante' && <th>Código Estudiante</th>}
                  {rolActivo === 'revisor' && <th>Tipos de Licencia Asignados</th>}
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--upds-text-muted)' }}>
                      Sin registros en esta categoría.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      {rolActivo === 'estudiante' && <td>{u.codigo_estudiante || '—'}</td>}
                      {rolActivo === 'revisor' && (
                        <td>
                          {(u.tipos_licencia_asignados || []).length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {u.tipos_licencia_asignados.map((t) => (
                                <span key={t.id} style={{ background: '#e9ecef', color: '#495057', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                                  {t.nombre}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--upds-text-muted)', fontSize: '0.85rem' }}>Sin tipos asignados</span>
                          )}
                        </td>
                      )}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => abrirEdicion(u)}
                            className="upds-btn upds-btn-outline"
                            style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarUsuario(u.id)}
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

        {meta && meta.lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--upds-border)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--upds-text-muted)' }}>
              Página <strong>{meta.currentPage}</strong> de <strong>{meta.lastPage}</strong> ({meta.total} usuarios)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="upds-btn upds-btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </button>
              <button
                className="upds-btn upds-btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
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