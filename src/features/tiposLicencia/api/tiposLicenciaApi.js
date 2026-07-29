import api from '../../../components/api/axios';

export const tiposLicenciaApi = {
  listar: () => api.get('/tipos-licencia'),
  crear: (datos) => api.post('/tipos-licencia', datos),
  actualizar: (id, datos) => api.put(`/tipos-licencia/${id}`, datos),
  eliminar: (id) => api.delete(`/tipos-licencia/${id}`),
};