import api from '../../../components/api/axios';

export const usuariosApi = {
  listar: (role = null, page = 1, q = '') => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (page) params.set('page', page);
    if (q) params.set('q', q);
    return api.get(`/users?${params.toString()}`);
  },
  crear: (datos) => api.post('/users', datos),
  actualizar: (id, datos) => api.put(`/users/${id}`, datos),
  eliminar: (id) => api.delete(`/users/${id}`),
  asignarTipos: (id, tipo_licencia_ids) => api.put(`/users/${id}/tipos-licencia`, { tipo_licencia_ids }),
};