import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const TOKEN_KEY = 'auth_token';
const USER_ROLE_KEY = 'user_role';
const USER_ID_KEY = 'user_id';
const USER_NAME_KEY = 'user_name';

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
  headers: { 'Content-Type': 'application/json' },
});

export async function login(email, password) {
  try {
    const res = await axiosInstance.post('/auth/login', { email, password });
    const data = res.data;

    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    if (data.rol) localStorage.setItem(USER_ROLE_KEY, normalizeRole(data.rol));
    if (data.id) localStorage.setItem(USER_ID_KEY, String(data.id));
    if (data.nombre) localStorage.setItem(USER_NAME_KEY, data.nombre);

    return data;
  } catch (err) {
    console.error('Error en login:', err);
    const message = err?.response?.data?.message || err.message || 'Error en la autenticación';
    throw new Error(message);
  }
}

export async function register(nombre, email, password) {
  try {
    const payload = {
      name: nombre,
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

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
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

