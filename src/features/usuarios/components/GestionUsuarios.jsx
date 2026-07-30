import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const [resUsuarios, resTipos] = await Promise.all([
        usuariosApi.listar(rolActivo, page, busqueda),
        tiposLicenciaApi.listar(),
      ]);
      setUsuarios(resUsuarios.data.data);
      setMeta({ currentPage: resUsuarios.data.current_page, lastPage: resUsuarios.data.last_page, total: resUsuarios.data.total });
      setTipos(resTipos.data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [rolActivo, page]);

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

  return (
    <div style={{ maxWidth: 900, margin: '40px auto' }}>
      <Link to="/solicitudes">← Volver</Link>
      <h2>Gestión de usuarios</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: 16 }}>
        {ROLES.map((r) => (
          <button
            key={r.value}
            onClick={() => cambiarPestana(r.value)}
            style={{ marginRight: 8, fontWeight: rolActivo === r.value ? 'bold' : 'normal' }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={abrirNuevo}>
          + Nuevo {ROLES.find((r) => r.value === rolActivo)?.label.toLowerCase().replace(/s$/, '')}
        </button>

        <form onSubmit={buscar}>
          <input
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: 220 }}
          />
          <button type="submit">Buscar</button>
        </form>
      </div>

      {mostrarForm && (
        <form onSubmit={guardarUsuario} style={{ margin: '16px 0', padding: 12, border: '1px solid #444' }}>
          {errorForm && <p style={{ color: 'red' }}>{errorForm}</p>}

          <p style={{ color: '#888', fontSize: 13 }}>
            Rol: <strong>{ROLES.find((r) => r.value === (editandoId ? editandoRole : rolActivo))?.label.replace(/s$/, '')}</strong>
          </p>

          <input
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={{ display: 'block', width: '100%', marginBottom: 8 }}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ display: 'block', width: '100%', marginBottom: 8 }}
          />
          <input
            type="password"
            placeholder={editandoId ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña (mínimo 8 caracteres)'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editandoId}
            style={{ display: 'block', width: '100%', marginBottom: 8 }}
          />

          {(editandoId ? editandoRole : rolActivo) === 'revisor' && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ marginBottom: 4 }}>Tipos de licencia que puede revisar:</p>
              {tipos.map((t) => (
                <label key={t.id} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    checked={form.tipo_licencia_ids.includes(t.id)}
                    onChange={() => toggleTipoForm(t.id)}
                  />{' '}
                  {t.nombre}
                </label>
              ))}
            </div>
          )}

          <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear'}</button>
          <button type="button" onClick={() => { setMostrarForm(false); setEditandoId(null); }}>Cancelar</button>
        </form>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                {rolActivo === 'estudiante' && <th>Código</th>}
                {rolActivo === 'revisor' && <th>Tipos asignados</th>}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>Sin registros.</td></tr>
              )}
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  {rolActivo === 'estudiante' && <td>{u.codigo_estudiante || '—'}</td>}
                  {rolActivo === 'revisor' && (
                    <td>
                      {(u.tipos_licencia_asignados || []).length > 0
                        ? u.tipos_licencia_asignados.map((t) => t.nombre).join(', ')
                        : <span style={{ color: '#888' }}>Sin tipos asignados</span>}
                    </td>
                  )}
                  <td>
                    <button onClick={() => abrirEdicion(u)}>Editar</button>
                    <button onClick={() => eliminarUsuario(u.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {meta && meta.lastPage > 1 && (
            <div style={{ marginTop: 16 }}>
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
              <span style={{ margin: '0 12px' }}>Página {meta.currentPage} de {meta.lastPage} ({meta.total} total)</span>
              <button disabled={page >= meta.lastPage} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}