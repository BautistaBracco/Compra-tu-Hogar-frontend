import { useState } from 'react';

export function Register() {
  const [nombre, setNombre] = useState('');
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState('comprador');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones locales
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!mail.trim()) {
      setError('El correo electrónico es requerido');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          mail,
          password,
          rol,
        }),
      });

      if (response.status === 409) {
        setError('El correo electrónico ya está registrado');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error al registrar usuario (${response.status})`,
        }));
        setError(errorData.message || 'Error al registrar usuario');
        return;
      }

      const data = await response.json();
      setSuccess(
        `¡Registro exitoso! Bienvenido, ${data.nombre}. Redirigiendo al login...`
      );

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error en la conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Crear Cuenta</h1>
          <p style={styles.subtitle}>Compra Tu Hogar</p>
          <p style={styles.description}>
            Únete a nuestra comunidad de compradores e inmobiliarias.
          </p>
        </div>

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="nombre" style={styles.label}>
              Nombre Completo
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              required
              style={styles.input}
            />
          </div>

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
            <label htmlFor="rol" style={styles.label}>
              Tipo de Cuenta
            </label>
            <select
              id="rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              style={styles.select}
            >
              <option value="comprador">Comprador</option>
              <option value="inmobiliaria">Inmobiliaria</option>
            </select>
            <p style={styles.roleInfo}>
              {rol === 'comprador'
                ? 'Consulta propiedades, guarda favoritos, deja reseñas y realiza compras'
                : 'Gestiona tus propiedades, consulta ventas y clientes'}
            </p>
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

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              required
              minLength="8"
              style={styles.input}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            ¿Ya tienes cuenta?{' '}
            <a href="/login" style={styles.link}>
              Inicia sesión aquí
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
    padding: 'clamp(32px, 5vw, 48px) clamp(24px, 5vw, 40px)',
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
  select: {
    padding: '12px 14px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
    width: '100%',
  },
  roleInfo: {
    fontSize: '12px',
    color: '#666',
    margin: '4px 0 0 0',
    fontStyle: 'italic',
    lineHeight: '1.4',
  },
  button: {
    padding: '14px',
    fontSize: 'clamp(14px, 3vw, 16px)',
    fontWeight: '700',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    marginTop: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  error: {
    padding: '12px 14px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '6px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    border: '1px solid #f5c6cb',
  },
  success: {
    padding: '12px 14px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '6px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    border: '1px solid #c3e6cb',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
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






