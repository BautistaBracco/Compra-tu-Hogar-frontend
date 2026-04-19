import { useState } from 'react';
import { login } from '../auth';

export function Login() {
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
      const userRole = response.usuario.rol;

      // Redirigir según el rol del usuario
      if (userRole === 'administrador') {
        window.location.href = '/admin';
      } else if (userRole === 'comprador') {
        window.location.href = '/home';
      } else if (userRole === 'inmobiliaria') {
        window.location.href = '/inmobiliaria';
      }
    } catch (err) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Iniciar Sesión</h1>
          <p style={styles.subtitle}>Compra Tu Hogar</p>
          <p style={styles.description}>
            Accede a tu cuenta para gestionar propiedades, realizar compras y más.
          </p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="mail" style={styles.label}>
              Correo Electrónico
            </label>
            <input
              id="mail"
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="tu@correo.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              minLength="8"
              style={styles.input}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            ¿No tienes cuenta?{' '}
            <a href="/register" style={styles.link}>
              Registrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
    width: '100%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
  },
  header: {
    marginBottom: '36px',
    textAlign: 'center',
  },
  title: {
    fontSize: 'clamp(24px, 5vw, 32px)',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#222',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: 'clamp(12px, 3vw, 14px)',
    color: '#888',
    marginBottom: '12px',
    fontWeight: '500',
  },
  description: {
    fontSize: 'clamp(12px, 2.5vw, 13px)',
    color: '#999',
    lineHeight: '1.5',
    margin: '0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '12px 14px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    boxSizing: 'border-box',
    width: '100%',
  },
  button: {
    padding: '14px',
    fontSize: 'clamp(14px, 3vw, 16px)',
    fontWeight: '700',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    marginTop: '12px',
    transition: 'background-color 0.3s',
    cursor: 'pointer',
  },
  error: {
    padding: '12px 14px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '6px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    border: '1px solid #f5c6cb',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    color: '#666',
    margin: '0',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.3s',
  },
};



