/**
 * GUÍA DE INTEGRACIÓN - Login y Register
 *
 * Este archivo muestra cómo integrar los componentes Login y Register
 * en tu aplicación React con React Router.
 */

// ═══════════════════════════════════════════════════════════════
// OPCIÓN 1: Con React Router (RECOMENDADO)
// ═══════════════════════════════════════════════════════════════

/*
1. Primero, instala React Router:
   npm install react-router-dom

2. En tu main.jsx o App.jsx, configura las rutas:

   import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
   import { Login } from './components/Login';
   import { Register } from './components/Register';

   function App() {
     return (
       <BrowserRouter>
         <Routes>
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
           <Route path="/home" element={<Home />} />
           <Route path="/admin" element={<AdminPanel />} />
           <Route path="/inmobiliaria" element={<InmobiliariaPanel />} />
           <Route path="/" element={<Navigate to="/login" />} />
         </Routes>
       </BrowserRouter>
     );
   }

3. En el componente Login.jsx, para usar Navigate:

   import { useState } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { login } from '../auth';

   export function Login() {
     const [mail, setMail] = useState('');
     const [password, setPassword] = useState('');
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const navigate = useNavigate();

     const handleLogin = async (e) => {
       e.preventDefault();
       setLoading(true);
       setError('');

       try {
         const response = await login(mail, password);
         const userRole = response.usuario.rol;

         if (userRole === 'administrador') {
           navigate('/admin');
         } else if (userRole === 'comprador') {
           navigate('/home');
         } else if (userRole === 'inmobiliaria') {
           navigate('/inmobiliaria');
         }
       } catch (err) {
         setError(err.message || 'Error en la autenticación');
       } finally {
         setLoading(false);
       }
     };

     // ... resto del componente
   }
*/

// ═══════════════════════════════════════════════════════════════
// OPCIÓN 2: Sin React Router (Usar window.location)
// ═══════════════════════════════════════════════════════════════

/*
Los componentes Login.jsx y Register.jsx ya implementan esta opción
usando window.location.href para redirigir.

Ventajas:
- Sin dependencias externas
- Funciona en cualquier setup

Desventajas:
- Recarga la página (menos smooth)
- No preserva scroll position
*/

// ═══════════════════════════════════════════════════════════════
// PROTEGER RUTAS
// ═══════════════════════════════════════════════════════════════

/*
Crear un componente ProtectedRoute para proteger rutas autenticadas:

import { Navigate } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../auth';

export function ProtectedRoute({ element, requiredRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return element;
}

Uso en App.jsx:

<Route
  path="/admin"
  element={<ProtectedRoute element={<AdminPanel />} requiredRole="administrador" />}
/>

<Route
  path="/home"
  element={<ProtectedRoute element={<Home />} requiredRole="comprador" />}
/>

<Route
  path="/inmobiliaria"
  element={<ProtectedRoute element={<InmobiliariaPanel />} requiredRole="inmobiliaria" />}
/>
*/

// ═══════════════════════════════════════════════════════════════
// MANEJAR TOKENS EXPIRADOS
// ═══════════════════════════════════════════════════════════════

/*
En api.js ya se maneja automáticamente:

if (response.status === 401) {
  logout();
  window.location.href = '/login';
  throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
}

Esto redirige automáticamente al login si el token expira.
*/

// ═══════════════════════════════════════════════════════════════
// FLUJO COMPLETO DE AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════

/*
1. Usuario entra a /login → Login.jsx
   ↓
2. Ingresa credenciales
   ↓
3. login() en auth.js llama a /auth/login
   ↓
4. Si es exitoso, guarda JWT + rol en localStorage
   ↓
5. Redirige según rol:
   - administrador → /admin
   - comprador → /home
   - inmobiliaria → /inmobiliaria
   ↓
6. Componentes protegidos verifican isAuthenticated() y getUserRole()
   ↓
7. Todas las peticiones incluyen automáticamente el JWT
   ↓
8. Si token expira (401), vuelve a /login

Para Registro:
1. Usuario entra a /register → Register.jsx
   ↓
2. Completa el formulario
   ↓
3. register() en Register.jsx llama a /auth/register
   ↓
4. Si es exitoso, muestra éxito y redirige a /login
   ↓
5. Usuario inicia sesión normalmente
*/

// ═══════════════════════════════════════════════════════════════
// EJEMPLO COMPLETO DE App.jsx CON REACT ROUTER
// ═══════════════════════════════════════════════════════════════

/*
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, hasRole } from './auth';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Home } from './pages/Home';
import { AdminPanel } from './pages/AdminPanel';
import { InmobiliariaPanel } from './pages/InmobiliariaPanel';

function ProtectedRoute({ element, requiredRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return element;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas por rol */}
        <Route
          path="/home"
          element={
            <ProtectedRoute
              element={<Home />}
              requiredRole="comprador"
            />
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              element={<AdminPanel />}
              requiredRole="administrador"
            />
          }
        />
        <Route
          path="/inmobiliaria"
          element={
            <ProtectedRoute
              element={<InmobiliariaPanel />}
              requiredRole="inmobiliaria"
            />
          }
        />

        {/* Rutas por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/unauthorized" element={<h1>Acceso Denegado</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
*/

// ═══════════════════════════════════════════════════════════════
// VERIFICAR ESTADO EN COMPONENTES
// ═══════════════════════════════════════════════════════════════

/*
import { isAuthenticated, getUserRole, getUserName, logout } from '../auth';

export function Header() {
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <header>
      <p>Bienvenido, {getUserName()}</p>
      <p>Rol: {getUserRole()}</p>
      <button onClick={() => {
        logout();
        window.location.href = '/login';
      }}>
        Cerrar sesión
      </button>
    </header>
  );
}
*/

// ═══════════════════════════════════════════════════════════════
// NOTAS IMPORTANTES
// ═══════════════════════════════════════════════════════════════

/*
✅ Los componentes Login.jsx y Register.jsx:
  - Usan useState para manejar el estado del formulario
  - No tienen dependencias externas (solo React)
  - Validan datos localmente antes de enviar
  - Manejan errores y casos de éxito
  - Usan window.location.href para redirecciones

✅ El archivo auth.js:
  - Gestiona todo el flujo de autenticación
  - Guarda JWT y rol en localStorage
  - Incluye headers de autenticación automáticamente
  - Maneja tokens expirados

✅ Los roles según el OpenAPI:
  - "administrador" → /admin
  - "comprador" → /home
  - "inmobiliaria" → /inmobiliaria

⚠️  Consideraciones de seguridad:
  - localStorage no es 100% seguro (vulnerable a XSS)
  - Para mayor seguridad, considera usar cookies HttpOnly
  - Siempre usa HTTPS en producción
  - Valida permisos también en el backend

✨ Para mejor UX:
  - Usa React Router + useNavigate en lugar de window.location.href
  - Implementa refresh tokens para renovar sesión automáticamente
  - Crea un componente ProtectedRoute reutilizable
  - Usa Context API para estado global de autenticación
*/

export function IntegrationGuide() {
  return (
    <div>
      <h1>Guía de Integración de Login y Register</h1>
      <p>Ver comentarios en auth.integration.jsx para detalles completos</p>
    </div>
  );
}

