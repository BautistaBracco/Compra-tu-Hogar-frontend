// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Claves de localStorage
const TOKEN_KEY = 'auth_token';
const USER_ROLE_KEY = 'user_role';
const USER_ID_KEY = 'user_id';
const USER_NAME_KEY = 'user_name';

/**
 * Realiza el login del usuario
 * @param {string} mail - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} - Objeto con token y usuario
 * @throws {Error} - Error en caso de fallo en la autenticación
 */
export async function login(mail, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mail,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en la autenticación');
    }

    const data = await response.json();

    // Guardar token JWT en localStorage
    localStorage.setItem(TOKEN_KEY, data.token);

    // Guardar rol del usuario en localStorage
    localStorage.setItem(USER_ROLE_KEY, data.usuario.rol);

    // Guardar ID del usuario
    localStorage.setItem(USER_ID_KEY, data.usuario.id);

    // Guardar nombre del usuario
    localStorage.setItem(USER_NAME_KEY, data.usuario.nombre);

    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} - true si el usuario está autenticado, false en caso contrario
 */
export function isAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
}

/**
 * Obtiene el rol del usuario autenticado
 * @returns {string|null} - Rol del usuario (comprador, inmobiliaria, administrador) o null si no está autenticado
 */
export function getUserRole() {
  return localStorage.getItem(USER_ROLE_KEY);
}

/**
 * Obtiene el ID del usuario autenticado
 * @returns {string|null} - ID del usuario o null si no está autenticado
 */
export function getUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

/**
 * Obtiene el nombre del usuario autenticado
 * @returns {string|null} - Nombre del usuario o null si no está autenticado
 */
export function getUserName() {
  return localStorage.getItem(USER_NAME_KEY);
}

/**
 * Obtiene el token JWT del usuario autenticado
 * @returns {string|null} - Token JWT o null si no está autenticado
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Realiza el logout del usuario
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
}

/**
 * Retorna los headers necesarios para realizar peticiones autenticadas
 * @returns {Object} - Headers con el token JWT
 */
export function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Verifica si el usuario tiene un rol específico
 * @param {string|Array<string>} roles - Rol o array de roles a verificar
 * @returns {boolean} - true si el usuario tiene uno de los roles especificados
 */
export function hasRole(roles) {
  const userRole = getUserRole();
  if (!userRole) return false;

  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }

  return userRole === roles;
}

