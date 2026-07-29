import api from '../../../components/api/axios';

export const solicitudesApi = {
  listar: (page = 1) => api.get(`/solicitudes?page=${page}`),
  obtener: (id) => api.get(`/solicitudes/${id}`),
  crear: (tipo_licencia_id) => api.post('/solicitudes', { tipo_licencia_id }),
  actualizarEstado: (id, estado, motivo_rechazo = null) =>
    api.put(`/solicitudes/${id}`, { estado, motivo_rechazo }),
  eliminar: (id) => api.delete(`/solicitudes/${id}`),
  historial: (id) => api.get(`/solicitudes/${id}/historial`),
};