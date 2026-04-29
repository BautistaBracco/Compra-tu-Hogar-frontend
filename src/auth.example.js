/**
 * Ejemplo de cómo usar el módulo auth.js en componentes React
 *
 * Este archivo muestra ejemplos prácticos de uso de las funciones
 * de autenticación en componentes React.
 */

// ═══════════════════════════════════════════════════════════
// 1. COMPONENTE DE LOGIN
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';
import { login, isAuthenticated, getUserRole } from './auth';

export function LoginComponent() {
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(mail, password);
      console.log('Login exitoso:', response);
      // Redirigir al dashboard o página principal
      // navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={mail}
        onChange={(e) => setMail(e.target.value)}
        placeholder="Correo electrónico"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

// ═══════════════════════════════════════════════════════════
// 2. COMPONENTE PROTEGIDO CON VERIFICACIÓN DE AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════
import { isAuthenticated, logout } from './auth';

export function ProtectedComponent() {
  if (!isAuthenticated()) {
    return <div>Por favor, inicia sesión</div>;
  }

  return (
    <div>
      <h1>Bienvenido al Dashboard</h1>
      <button onClick={() => {
        logout();
        // Redirigir al login: navigate('/login');
      }}>
        Cerrar sesión
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 3. COMPONENTE CON CONTROL DE ROLES
// ═══════════════════════════════════════════════════════════
import { hasRole } from './auth';

export function AdminPanel() {
  if (!hasRole(['administrador', 'inmobiliaria'])) {
    return <div>No tienes permisos para acceder a esta página</div>;
  }

  return (
    <div>
      <h1>Panel de administración</h1>
      {/* Contenido solo para admin e inmobiliarias */}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 4. PETICIÓN AUTENTICADA A LA API
// ═══════════════════════════════════════════════════════════
import { getAuthHeaders } from './auth';

export async function fetchUserProfile(userId) {
  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/usuarios/${userId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener el perfil');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// 5. HOOK PERSONALIZADO PARA AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import {
  login as authLogin,
  isAuthenticated as checkAuth,
  getUserRole,
  logout as authLogout
} from './auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());
  const [userRole, setUserRole] = useState(getUserRole());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (mail, password) => {
    setLoading(true);
    setError('');
    try {
      await authLogin(mail, password);
      setIsAuthenticated(true);
      setUserRole(getUserRole());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authLogout();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return {
    isAuthenticated,
    userRole,
    login,
    logout,
    loading,
    error,
  };
}

// ═══════════════════════════════════════════════════════════
// EJEMPLO DE USO DEL HOOK
// ═══════════════════════════════════════════════════════════
export function MyComponent() {
  const { isAuthenticated, userRole, login, logout, loading } = useAuth();

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={() => login('user@email.com', 'password123')}>
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>
      ) : (
        <div>
          <p>Rol: {userRole}</p>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}

