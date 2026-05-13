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
  try {
    if (!(file instanceof File)) {
      throw new Error('Archivo inválido. Selecciona una imagen nuevamente.');
    }

    const token = getToken();
    const formData = new FormData();
    formData.append('file', file, file.name);

    const res = await axios.post(`${API_BASE_URL}/usuarios/imagen`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const imageUrl = res?.data?.url;
    const usuario = res?.data?.usuario;
    if (usuario) {
      if (usuario.email) localStorage.setItem(USER_EMAIL_KEY, usuario.email);
      if (usuario.nombre) localStorage.setItem(USER_NAME_KEY, usuario.nombre);
      if (usuario.icono) setUserIcon(usuario.icono);
    } else if (imageUrl) {
      setUserIcon(imageUrl);
    }

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

export function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
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

export async function obtenerInmobiliarias(page = 0, size = 20) {
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

