import axios from 'axios';
import { logout, getToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Crear instancia axios con baseURL y manejo de 401
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Adjuntar token automáticamente antes de cada request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejar respuestas (especialmente 401)
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Limpiar sesión y redirigir
      try {
        logout();
      } catch (e) {
        // noop
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * apiCall con axios
 * @param {string} endpoint
 * @param {{method?:string, data?:any, params?:object}} options
 */
export async function apiCall(endpoint, options = {}) {
  try {
    const method = (options.method || 'GET').toLowerCase();
    const config = {
      url: endpoint,
      method,
      data: options.body ?? options.data,
      params: options.params,
      headers: options.headers,
    };

    const res = await api.request(config);
    // 204 -> null
    if (res.status === 204) return null;
    return res.data;
  } catch (err) {
    console.error('API Error:', err);
    // Intentar extraer mensaje
    const message = err?.response?.data?.message || err.message || 'Error en la petición API';
    throw new Error(message);
  }
}

export function apiGet(endpoint, params = {}) {
  return apiCall(endpoint, { method: 'GET', params });
}

export function apiPost(endpoint, data) {
  return apiCall(endpoint, { method: 'POST', data });
}

export function apiPut(endpoint, data) {
  return apiCall(endpoint, { method: 'PUT', data });
}

export function apiDelete(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' });
}

export function apiPatch(endpoint, data) {
  return apiCall(endpoint, { method: 'PATCH', data });
}
