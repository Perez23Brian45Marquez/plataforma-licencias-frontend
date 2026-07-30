import api from "../../../components/api/axios";

export const solicitudesApi = {
  listar: (page = 1, q = "", estado = "") => {
    const params = new URLSearchParams();
    params.set("page", page);
    if (q) params.set("q", q);
    if (estado) params.set("estado", estado);
    return api.get(`/solicitudes?${params.toString()}`);
  },
  obtener: (id) => api.get(`/solicitudes/${id}`),
  crear: (tipo_licencia_id, archivo) => {
    const formData = new FormData();
    formData.append("tipo_licencia_id", tipo_licencia_id);
    formData.append("justificativo", archivo);
    return api.post("/solicitudes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  agregarJustificativo: (id, archivo) => {
    const formData = new FormData();
    formData.append("justificativo", archivo);
    return api.post(`/solicitudes/${id}/justificativos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  actualizarEstado: (
    id,
    estado,
    motivo_rechazo = null,
    tipo_licencia_id = null,
  ) => {
    const payload = { estado, motivo_rechazo };
    if (tipo_licencia_id) payload.tipo_licencia_id = tipo_licencia_id;
    return api.put(`/solicitudes/${id}`, payload);
  },
  eliminar: (id) => api.delete(`/solicitudes/${id}`),
  historial: (id) => api.get(`/solicitudes/${id}/historial`),
};
