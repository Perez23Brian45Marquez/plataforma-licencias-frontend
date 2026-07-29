import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  if (loading) return <p>Cargando...</p>;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <Link to="/solicitudes">← Volver</Link>
      <h2>Tipos de licencia</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={() => abrirFormulario()}>+ Nuevo tipo</button>

      {editando && (
        <form onSubmit={guardar} style={{ margin: '16px 0', padding: 12, border: '1px solid #444' }}>
          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            style={{ display: 'block', width: '100%', marginBottom: 8 }}
          />
          <textarea
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            style={{ display: 'block', width: '100%', marginBottom: 8 }}
          />
          <input
            type="number"
            placeholder="Días estimados"
            value={form.dias_estimados}
            onChange={(e) => setForm({ ...form, dias_estimados: e.target.value })}
            required
            style={{ display: 'block', width: '100%', marginBottom: 8 }}
          />
          <button type="submit">Guardar</button>
          <button type="button" onClick={() => setEditando(null)}>Cancelar</button>
        </form>
      )}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Días estimados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map((t) => (
            <tr key={t.id}>
              <td>{t.nombre}</td>
              <td>{t.dias_estimados}</td>
              <td>
                <button onClick={() => abrirFormulario(t)}>Editar</button>
                <button onClick={() => eliminar(t.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}