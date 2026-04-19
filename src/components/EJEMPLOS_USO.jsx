/**
 * EJEMPLOS DE USO - Login.jsx y Register.jsx
 *
 * Diferentes formas de integrar y usar los componentes
 */

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 1: App Simple Sin Router
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { isAuthenticated } from './auth';

export function App() {
  const [showRegister, setShowRegister] = useState(false);

  if (!isAuthenticated()) {
    return showRegister ? (
      <div>
        <Register />
        <button
          onClick={() => setShowRegister(false)}
          style={{ position: 'fixed', top: '10px', left: '10px' }}
        >
          Ir a Login
        </button>
      </div>
    ) : (
      <div>
        <Login />
        <button
          onClick={() => setShowRegister(true)}
          style={{ position: 'fixed', top: '10px', left: '10px' }}
        >
          Ir a Registro
        </button>
      </div>
    );
  }

  // Usuario autenticado - renderizar dashboard
  return <Dashboard />;
}

function Dashboard() {
  return <h1>¡Bienvenido al dashboard!</h1>;
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 2: Con React Router (RECOMENDADO)
// ═══════════════════════════════════════════════════════════════
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { isAuthenticated, hasRole } from './auth';

function ProtectedRoute({ children, requiredRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

export function AppWithRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas - Comprador */}
        <Route
          path="/home"
          element={
            <ProtectedRoute requiredRole="comprador">
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas - Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="administrador">
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas - Inmobiliaria */}
        <Route
          path="/inmobiliaria"
          element={
            <ProtectedRoute requiredRole="inmobiliaria">
              <InmobiliariaPanel />
            </ProtectedRoute>
          }
        />

        {/* Rutas de error */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 3: Layout Con Header y Sidebar
// ═══════════════════════════════════════════════════════════════
import { isAuthenticated, getUserName, getUserRole, logout } from './auth';

export function Layout({ children }) {
  if (!isAuthenticated()) {
    return children; // No mostrar header si no está autenticado
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <main style={{ padding: '20px' }}>{children}</main>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header style={styles.header}>
      <h2>Compra Tu Hogar</h2>
      <div style={styles.userInfo}>
        <span>👤 {getUserName()}</span>
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          style={styles.logoutBtn}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

function Sidebar() {
  const role = getUserRole();

  return (
    <aside style={styles.sidebar}>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {role === 'comprador' && (
            <>
              <li>
                <a href="/home">🏠 Inicio</a>
              </li>
              <li>
                <a href="/home/propiedades">🏘️ Propiedades</a>
              </li>
              <li>
                <a href="/home/favoritos">❤️ Favoritos</a>
              </li>
              <li>
                <a href="/home/compras">🛒 Mis Compras</a>
              </li>
            </>
          )}

          {role === 'administrador' && (
            <>
              <li>
                <a href="/admin">📊 Dashboard</a>
              </li>
              <li>
                <a href="/admin/usuarios">👥 Usuarios</a>
              </li>
              <li>
                <a href="/admin/inmobiliarias">🏢 Inmobiliarias</a>
              </li>
              <li>
                <a href="/admin/reportes">📈 Reportes</a>
              </li>
            </>
          )}

          {role === 'inmobiliaria' && (
            <>
              <li>
                <a href="/inmobiliaria">📊 Dashboard</a>
              </li>
              <li>
                <a href="/inmobiliaria/propiedades">🏘️ Mis Propiedades</a>
              </li>
              <li>
                <a href="/inmobiliaria/ventas">💰 Ventas</a>
              </li>
              <li>
                <a href="/inmobiliaria/clientes">👥 Clientes</a>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 4: Custom Hook para Autenticación
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { login as authLogin } from './auth';
import { isAuthenticated as checkAuth } from './auth';
import { logout as authLogout } from './auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (mail, password) => {
    setLoading(true);
    setError('');
    try {
      await authLogin(mail, password);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authLogout();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    login,
    logout,
    loading,
    error,
  };
}

// Usar en componente
export function LoginWithHook() {
  const { isAuthenticated, login, loading, error } = useAuth();

  const handleLogin = async (mail, password) => {
    const success = await login(mail, password);
    if (success) {
      console.log('Login exitoso');
    }
  };

  if (isAuthenticated) {
    return <h1>Ya está autenticado</h1>;
  }

  return <Login />; // O mostrar el login
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 5: Página de Inicio Condicional
// ═══════════════════════════════════════════════════════════════
import { isAuthenticated, hasRole } from './auth';

export function HomePage() {
  if (!isAuthenticated()) {
    return (
      <div style={styles.landingPage}>
        <h1>Bienvenido a Compra Tu Hogar</h1>
        <p>Busca tu propiedad ideal hoy</p>
        <button
          onClick={() => (window.location.href = '/login')}
          style={styles.primaryBtn}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => (window.location.href = '/register')}
          style={styles.secondaryBtn}
        >
          Crear Cuenta
        </button>
      </div>
    );
  }

  // Usuario autenticado
  if (hasRole('comprador')) {
    return <CompradorHome />;
  } else if (hasRole('administrador')) {
    return <AdminHome />;
  } else if (hasRole('inmobiliaria')) {
    return <InmobiliariaHome />;
  }

  return <div>Rol desconocido</div>;
}

// ═══════════════════════════════════════════════════════════════
// EJEMPLO 6: Manejo de Errores Global
// ═══════════════════════════════════════════════════════════════
export function LoginWithErrorHandling() {
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validación básica
      if (!mail.includes('@')) {
        throw new Error('Email inválido');
      }

      if (password.length < 8) {
        throw new Error('Contraseña muy corta');
      }

      // Llamar a login
      await login(mail, password);
      // No redirige aquí, Login.jsx se encarga
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido';

      // Mapear errores comunes
      let displayError = errorMessage;
      if (errorMessage.includes('401')) {
        displayError = 'Correo o contraseña incorrectos';
      } else if (errorMessage.includes('network')) {
        displayError = 'Error de conexión. Intenta más tarde.';
      }

      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Campos */}
      {error && (
        <div style={styles.errorAlert}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS COMPARTIDOS
// ═══════════════════════════════════════════════════════════════
const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#007bff',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  userInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRight: '1px solid #ddd',
  },
  landingPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
  },
  primaryBtn: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  secondaryBtn: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  errorAlert: {
    padding: '12px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '16px',
  },
};

// ═══════════════════════════════════════════════════════════════
// Componentes Placeholder (reemplazar con implementación real)
// ═══════════════════════════════════════════════════════════════
function Home() {
  return <h1>Home - Comprador</h1>;
}

function AdminPanel() {
  return <h1>Admin Panel</h1>;
}

function InmobiliariaPanel() {
  return <h1>Panel Inmobiliaria</h1>;
}

function Unauthorized() {
  return <h1>Acceso No Autorizado</h1>;
}

function CompradorHome() {
  return <h1>Bienvenido Comprador</h1>;
}

function AdminHome() {
  return <h1>Bienvenido Admin</h1>;
}

function InmobiliariaHome() {
  return <h1>Bienvenido Inmobiliaria</h1>;
}

