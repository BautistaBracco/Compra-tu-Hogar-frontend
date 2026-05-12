import { useState } from 'react';
import { login, register } from '../auth';
import '../styles/components/register.css';

export function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!email.trim()) {
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
      const data = await register(nombre, email, password);
      setSuccess(
          `¡Registro exitoso! Bienvenido, ${data.nombre || 'Usuario'}. Iniciando sesión...`
      );
      await login(email, password);
      window.location.href = '/home';
    } catch (err) {
      setError(err.message || 'Error en el registro. Por favor, intenta de nuevo.');
      console.error('Error de registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="register-wrapper">
        <div className="register-card">
          <div className="register-header">
            <h1 className="register-title">Crear Cuenta</h1>
            <p className="register-subtitle">Compra Tu Hogar</p>
            <p className="register-description">
              Regístrate como comprador para consultar propiedades, guardar favoritos y realizar compras.
            </p>
          </div>

          <form onSubmit={handleRegister} className="register-form">
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">
                Nombre Completo
              </label>
              <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Juan Pérez"
                  required
                  className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo Electrónico
              </label>
              <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
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
                  className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
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
                  className="form-input"
              />
            </div>

            {error && <div className="register-error">{error}</div>}
            {success && <div className="register-success">{success}</div>}

            <button
                type="submit"
                disabled={loading}
                className="register-button"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="register-footer">
            <p className="register-footer-text">
              ¿Ya tienes cuenta?{' '}
              <a href="/login" className="register-link">
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </div>
      </div>
  );
}

