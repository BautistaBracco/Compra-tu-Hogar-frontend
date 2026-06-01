import { useState } from 'react';
import { login } from '../auth';
import '../styles/components/login.css';

export function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [ui, setUi] = useState({
    loading: false,
    error: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setUi({ loading: true, error: '' });

    try {
      await login(form.email, form.password);
      window.location.href = '/home';
    } catch (err) {
      setUi({ loading: false, error: err.message || 'Error en la autenticación' });
    } finally {
      setUi((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">Compra Tu Hogar</p>
          <p className="login-description">
            Accede a tu cuenta para gestionar propiedades, realizar compras y más.
          </p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="mail" className="form-label">
              Correo Electrónico
            </label>
            <input
              id="mail"
              type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
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
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 8 caracteres"
              required
              minLength="8"
              className="form-input"
            />
          </div>

          {ui.error && <div className="login-error">{ui.error}</div>}

          <button
            type="submit"
            disabled={ui.loading}
            className="login-button"
          >
            {ui.loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="login-link">
              Registrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
