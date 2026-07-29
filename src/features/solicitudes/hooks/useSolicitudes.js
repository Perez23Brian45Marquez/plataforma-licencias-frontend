import { useState, useEffect, useCallback } from 'react';
import { solicitudesApi } from '../api/solicitudesApi';

export function useSolicitudes(page = 1) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await solicitudesApi.listar(page);
      setSolicitudes(response.data.data);
      setMeta({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
      });
    } catch (err) {
      setError('No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { solicitudes, meta, loading, error, recargar: cargar };
}