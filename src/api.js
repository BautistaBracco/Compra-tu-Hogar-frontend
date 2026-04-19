import { getAuthHeaders, logout } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

/**
 * Realiza una petición a la API
 * @param {string} endpoint - Endpoint de la API (ej: '/usuarios/1')
 * @param {Object} options - Opciones de fetch (method, body, etc.)
 * @returns {Promise<any>} - Respuesta JSON
 * @throws {Error} - Error en caso de fallo
 */
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Si recibimos 401 (Unauthorized), limpiar sesión
    if (response.status === 401) {
      logout();
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    // Si no es 2xx, lanzar error
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `Error HTTP ${response.status}`,
      }));
      throw new Error(error.message || `Error: ${response.status}`);
    }

    // Si la respuesta es 204 (No Content), retornar null
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * GET - Obtener datos
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} params - Parámetros de query
 * @returns {Promise<any>}
 */
export function apiGet(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return apiCall(url, {
    method: 'GET',
  });
}

/**
 * POST - Crear datos
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a enviar
 * @returns {Promise<any>}
 */
export function apiPost(endpoint, data) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT - Actualizar datos
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a enviar
 * @returns {Promise<any>}
 */
export function apiPut(endpoint, data) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE - Eliminar datos
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<null>}
 */
export function apiDelete(endpoint) {
  return apiCall(endpoint, {
    method: 'DELETE',
  });
}

/**
 * PATCH - Actualización parcial
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a enviar
 * @returns {Promise<any>}
 */
export function apiPatch(endpoint, data) {
  return apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Ejemplos de uso:
// ─────────────────────────────────────────────────
// apiGet('/usuarios', { page: 0, size: 10 })
// apiGet('/propiedades', { q: 'casa', tipo: 'departamento', precioMax: 100000 })
// apiPost('/compradores/1/compras', { propiedadId: 42, inmobiliariaId: 5 })
// apiPut('/usuarios/1', { nombre: 'Nuevo Nombre', mail: 'nuevo@mail.com' })
// apiDelete('/usuarios/1')

