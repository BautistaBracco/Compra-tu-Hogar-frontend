import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1' || 'http://localhost:8080';

const TOKEN_KEY = 'auth_token';
const USER_ROLE_KEY = 'user_role';
const USER_ID_KEY = 'user_id';
const USER_NAME_KEY = 'user_name';
const USER_EMAIL_KEY = 'user_email';
const USER_ICON_KEY = 'user_icon';

function decodeJwtPayload(token) {
  try {
    if (!token || !token.includes('.')) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function normalizeIconUrl(iconUrl) {
  const value = String(iconUrl || '').trim();
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;

  if (value.startsWith('/uploads/')) {
    return `${API_BASE_URL}${value}`;
  }

  if (value.startsWith('uploads/')) {
    return `${API_BASE_URL}/${value}`;
  }

  return value;
}

function normalizeRole(role) {
  const value = String(role || '').trim().toLowerCase();

  if (value === 'admin' || value === 'administrador' || value === 'role_admin') {
    return 'administrador';
  }

  if (value === 'inmobiliaria' || value === 'role_inmobiliaria') {
    return 'inmobiliaria';
  }

  if (value === 'comprador' || value === 'role_comprador') {
    return 'comprador';
  }

  return value;
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {},
});

// Interceptor para adjuntar token automáticamente en todas las requests
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignorar errores al obtener token
  }
  return config;
});

// Interceptor para manejar 401 (token inválido/expirado)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        console.warn('API returned 401 — cerrando sesión');
        logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login?expired=1';
        }
      } catch (e) {
        // ignorar
      }
    }
    return Promise.reject(error);
  },
);

export async function login(email, password) {
  try {
    const res = await axiosInstance.post('/auth/login', { email, password });
    const data = res.data;

    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    if (data.rol) localStorage.setItem(USER_ROLE_KEY, normalizeRole(data.rol));
    if (data.id) localStorage.setItem(USER_ID_KEY, String(data.id));
    if (data.nombre) localStorage.setItem(USER_NAME_KEY, data.nombre);
    if (data.email) localStorage.setItem(USER_EMAIL_KEY, data.email);
    else if (email) localStorage.setItem(USER_EMAIL_KEY, email);

    if (data.icono) setUserIcon(data.icono);

    return data;
  } catch (err) {
    console.error('Error en login:', err);
    const status = err?.response?.status;
    const backendMessage = String(err?.response?.data?.message || '').trim();
    const isGenericInternalError = backendMessage.toLowerCase().includes('error interno');

    let message = backendMessage || err.message || 'Error en la autenticación';

    if (status === 401 || status === 403 || isGenericInternalError) {
      message = 'Correo o contraseña incorrectos';
    }

    throw new Error(message);
  }
}

export async function register(nombre, email, password) {
  try {
    const payload = {
      nombre,
      email,
      password,
    };
    const res = await axiosInstance.post('/auth/register', payload);
    return res.data;
  } catch (err) {
    console.error('Error en register:', err);
    const message = err?.response?.data?.message || err.message || 'Error en el registro';
    throw new Error(message);
  }
}

export function isAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
}

export function getUserRole() {
  return localStorage.getItem(USER_ROLE_KEY);
}

export function getUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

export function getUserName() {
  return localStorage.getItem(USER_NAME_KEY);
}

export function getUserEmail() {
  const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
  if (storedEmail) return storedEmail;

  const token = getToken();
  const payload = decodeJwtPayload(token);
  const tokenEmail = payload?.sub;

  if (tokenEmail) {
    localStorage.setItem(USER_EMAIL_KEY, tokenEmail);
    return tokenEmail;
  }

  return null;
}

export function getUserIcon() {
  return normalizeIconUrl(localStorage.getItem(USER_ICON_KEY));
}

export function setUserIcon(iconUrl) {
  if (!iconUrl) {
    localStorage.removeItem(USER_ICON_KEY);
    return;
  }

  localStorage.setItem(USER_ICON_KEY, normalizeIconUrl(iconUrl));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_ICON_KEY);
}

export async function uploadUserImage(file) {
  if (!(file instanceof File)) {
    throw new Error('Archivo inválido. Selecciona una imagen nuevamente.');
  }

  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file, file.name);

    const res = await axios.post(`${API_BASE_URL}/usuarios/imagen`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err) {
    console.error('Error al subir imagen de perfil:', err);
    const status = err?.response?.status;
    const code = err?.response?.data?.code;
    const backendMessage = err?.response?.data?.message;

    if (status === 413) {
      throw new Error('La imagen es demasiado grande para el servidor.');
    }

    if (status === 400) {
      throw new Error(backendMessage || 'El archivo enviado no es válido.');
    }

    if (status === 500 && code === 'INTERNAL_ERROR') {
      throw new Error('No se pudo procesar la imagen. Intenta con otra foto (JPG/PNG) de menor tamaño.');
    }

    const message = backendMessage || err.message || 'Error al subir la imagen';
    throw new Error(message);
  }
}

export async function updateUserProfile(payload) {
  try {
    const token = getToken();
    const res = await axiosInstance.patch('/usuarios/perfil', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const usuario = res?.data;
    if (usuario?.nombre) localStorage.setItem(USER_NAME_KEY, usuario.nombre);
    if (usuario?.email) localStorage.setItem(USER_EMAIL_KEY, usuario.email);
    if (Object.prototype.hasOwnProperty.call(usuario || {}, 'icono')) {
      setUserIcon(usuario.icono);
    }

    return usuario;
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    const message = err?.response?.data?.message || err.message || 'Error al actualizar el perfil';
    throw new Error(message);
  }
}

export function hasRole(roles) {
  const userRole = getUserRole();
  if (!userRole) return false;
  if (Array.isArray(roles)) return roles.includes(userRole);
  return userRole === roles;
}

// ═══════════════════════════════════════════
// ADMIN FUNCTIONS
// ═══════════════════════════════════════════

export async function crearInmobiliaria(nombre, email, password) {
  try {
    const token = getToken();
    const payload = {
      nombre,
      email,
      password,
    };
    console.log('Payload enviado para crear inmobiliaria:', payload);
    const res = await axiosInstance.post('/admin/inmobiliaria', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error('Error al crear inmobiliaria:', err);
    console.error('Response data:', err?.response?.data);
    const message = err?.response?.data?.message || err.message || 'Error al crear la inmobiliaria';
    throw new Error(message);
  }
}

export async function obtenerInmobiliarias() {
  try {
    const token = getToken();
    const res = await axiosInstance.get('/admin/usuarios', {
      params: { rol: 'INMOBILIARIA' },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error('Error al obtener inmobiliarias:', err);
    console.error('Response data:', err?.response?.data);
    const message = err?.response?.data?.message || err.message || 'Error al obtener inmobiliarias';
    throw new Error(message);
  }
}

export async function crearCaracteristica(nombre, descripcion = '') {
  try {
    const token = getToken();
    // Intentar con diferentes formatos de payload
    const payload = {
      nombre: nombre,
      descripcion: descripcion || null,
    };
    console.log('Payload enviado:', payload);
    const res = await axiosInstance.post('/admin/caracteristicas', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error('Error al crear característica:', err);
    console.error('Response data:', err?.response?.data);
    const message = err?.response?.data?.message || err.message || 'Error al crear la característica';
    throw new Error(message);
  }
}

export async function obtenerCaracteristicas() {
  try {
    const token = getToken();
    const res = await axiosInstance.get('/usuarios/caracteristicas', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error('Error al obtener características:', err);
    const message = err?.response?.data?.message || err.message || 'Error al obtener características';
    throw new Error(message);
  }
}

// ═══════════════════════════════════════════
// INMOBILIARIA FUNCTIONS
// ═══════════════════════════════════════════

function sanitizeNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeInteger(value) {
  const parsed = sanitizeNumber(value);
  return parsed === null ? null : Math.trunc(parsed);
}

function sanitizeList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string') return [];

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizePublicationPayload(publicacion = {}) {
  const propiedad = publicacion.propiedad || {};
  const caracteristicaIds = Array.isArray(propiedad.caracteristicaIds)
    ? propiedad.caracteristicaIds
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id))
    : [];

  return {
    descripcion: String(publicacion.descripcion || '').trim(),
    precio: sanitizeNumber(publicacion.precio),
    imagenes: sanitizeList(publicacion.imagenes),
    propiedad: {
      tipo: propiedad.tipo,
      ubicacion: String(propiedad.ubicacion || '').trim(),
      piso: String(propiedad.piso || '').trim(),
      depto: String(propiedad.depto || '').trim(),
      superficie: sanitizeInteger(propiedad.superficie),
      ambientes: sanitizeInteger(propiedad.ambientes),
      sanitarios: sanitizeInteger(propiedad.sanitarios),
      expensas: sanitizeInteger(propiedad.expensas),
      caracteristicaIds,
    },
  };
}

function sanitizeUpdatePublicacionPayload(publicacion = {}) {
  return {
    descripcion: String(publicacion.descripcion || '').trim(),
    precio: sanitizeNumber(publicacion.precio),
    imagenes: sanitizeList(publicacion.imagenes),
  };
}

function appendQueryParam(params, key, value) {
  if (value === undefined || value === null || value === '') return;
  params.append(key, String(value));
}

export async function crearPublicacion(publicacion) {
  try {
    const token = getToken();
    const payload = sanitizePublicationPayload(publicacion);
    const res = await axiosInstance.post('/inmobiliaria/publicacion', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error('Error al crear publicación:', err);
    const message = err?.response?.data?.message || err.message || 'Error al crear la publicación';
    throw new Error(message);
  }
}

export async function obtenerPublicaciones(filtros = {}) {
  try {
    const token = getToken();
    const params = new URLSearchParams();

    appendQueryParam(params, 'vendida', filtros.vendida);
    appendQueryParam(params, 'tipo', filtros.tipo);
    appendQueryParam(params, 'minPrecio', filtros.minPrecio);
    appendQueryParam(params, 'maxPrecio', filtros.maxPrecio);
    appendQueryParam(params, 'ubicacion', filtros.ubicacion);
    appendQueryParam(params, 'ambientesMin', filtros.ambientesMin);
    appendQueryParam(params, 'ambientesMax', filtros.ambientesMax);
    appendQueryParam(params, 'inmobiliariaId', filtros.inmobiliariaId);

    if (Array.isArray(filtros.caracteristicaIds)) {
      filtros.caracteristicaIds
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id))
        .forEach((id) => params.append('caracteristicaIds', String(id)));
    }

    const res = await axiosInstance.get('/usuarios/publicaciones', {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (err) {
    console.error('Error al obtener publicaciones:', err);
    const message = err?.response?.data?.message || err.message || 'Error al obtener publicaciones';
    throw new Error(message);
  }
}

export async function obtenerPublicacionPorId(publicacionId) {
  try {
    const token = getToken();
    const res = await axiosInstance.get(`/usuarios/publicacion/${publicacionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (err) {
    console.error('Error al obtener publicación:', err);
    const message = err?.response?.data?.message || err.message || 'Error al obtener la publicación';
    throw new Error(message);
  }
}

export async function agregarFavorito(publicacionId) {
  try {
    const token = getToken();
    const res = await axiosInstance.post(`/comprador/favoritos/${publicacionId}`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (err) {
    console.error('Error al agregar favorito:', err);
    const message = err?.response?.data?.message || err.message || 'Error al agregar favorito';
    throw new Error(message);
  }
}

export async function eliminarFavorito(publicacionId) {
  try {
    const token = getToken();
    await axiosInstance.delete(`/comprador/favoritos/${publicacionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error('Error al eliminar favorito:', err);
    const message = err?.response?.data?.message || err.message || 'Error al eliminar favorito';
    throw new Error(message);
  }
}

export async function obtenerFavoritos() {
  try {
    const token = getToken();
    const res = await axiosInstance.get('/comprador/favoritos', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (err) {
    console.error('Error al obtener favoritos:', err);
    const message = err?.response?.data?.message || err.message || 'Error al obtener favoritos';
    throw new Error(message);
  }
}

export async function agregarResena(publicacionId, payload) {
  try {
    const token = getToken();
    const res = await axiosInstance.post(`/comprador/reseñas/${publicacionId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (err) {
    console.error('Error al agregar reseña:', err);
    const message = err?.response?.data?.message || err.message || 'Error al agregar la reseña';
    throw new Error(message);
  }
}

export async function eliminarResena(resenaId) {
  try {
    const token = getToken();
    await axiosInstance.delete(`/comprador/reseñas/${resenaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error('Error al eliminar reseña:', err);
    const message = err?.response?.data?.message || err.message || 'Error al eliminar la reseña';
    throw new Error(message);
  }
}

export async function obtenerResenasPublicacion(publicacionId) {
  try {
    const token = getToken();
    const res = await axiosInstance.get(`/usuarios/publicaciones/${publicacionId}/reseñas`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (err) {
    console.error('Error al obtener reseñas:', err);
    const message = err?.response?.data?.message || err.message || 'Error al obtener las reseñas';
    throw new Error(message);
  }
}

export async function comprarPublicacion(publicacionId) {
  try {
    const token = getToken();
    await axiosInstance.post(`/comprador/comprar/${publicacionId}`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error('Error al comprar publicación:', err);
    const message = err?.response?.data?.message || err.message || 'Error al comprar la propiedad';
    throw new Error(message);
  }
}

export async function obtenerPropiedadPorUbicacion(ubicacion, piso = '', depto = '') {
  try {
    const token = getToken();
    const encodedUbicacion = encodeURIComponent(String(ubicacion || '').trim());
    const res = await axiosInstance.get(`/usuarios/propiedad/${encodedUbicacion}`, {
      params: {
        piso,
        depto,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (err) {
    if (err?.response?.status === 404) return null;

    console.error('Error al obtener propiedad por ubicación:', err);
    const message = err?.response?.data?.message || err.message || 'Error al obtener la propiedad';
    throw new Error(message);
  }
}

export async function modificarPublicacion(publicacion, payload = null) {
  const id = typeof publicacion === 'object' ? publicacion?.id : publicacion;

  if (!id) {
    throw new Error('No se pudo identificar la publicación a modificar');
  }

  try {
    const token = getToken();
    const body = sanitizeUpdatePublicacionPayload(payload || publicacion);

    const res = await axiosInstance.put(`/inmobiliaria/publicacion/${id}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (err) {
    console.error('Error al modificar publicación:', err);
    const message = err?.response?.data?.message || err.message || 'Error al modificar la publicación';
    throw new Error(message);
  }
}

export async function eliminarPublicacion(publicacion) {
  const id = typeof publicacion === 'object' ? publicacion?.id : publicacion;

  if (!id) {
    throw new Error('No se pudo identificar la publicación a eliminar');
  }

  try {
    const token = getToken();

    await axiosInstance.delete(`/inmobiliaria/publicacion/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error('Error al eliminar publicación:', err);
    const message = err?.response?.data?.message || err.message || 'Error al eliminar la publicación';
    throw new Error(message);
  }
}

