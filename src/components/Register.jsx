import { useState } from 'react';
import { login, register } from '../auth';
import '../styles/components/register.css';

export function Register() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [ui, setUi] = useState({
    loading: false,
    error: '',
    success: '',
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setUi((prev) => ({ ...prev, error: '', success: '', loading: false }));

    if (!form.nombre.trim()) {
      setUi((prev) => ({ ...prev, error: 'El nombre es requerido' }));
      return;
    }

    if (!form.email.trim()) {
      setUi((prev) => ({ ...prev, error: 'El correo electrónico es requerido' }));
      return;
    }

    if (form.password.length < 8) {
      setUi((prev) => ({ ...prev, error: 'La contraseña debe tener mínimo 8 caracteres' }));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setUi((prev) => ({ ...prev, error: 'Las contraseñas no coinciden' }));
      return;
    }

    setUi((prev) => ({ ...prev, loading: true, error: '', success: '' }));

    try {
      const data = await register(form.nombre, form.email, form.password);
      setUi((prev) => ({
        ...prev,
        success:
          `¡Registro exitoso! Bienvenido, ${data.nombre || 'Usuario'}. Iniciando sesión...`
      }));
      await login(form.email, form.password);
      window.location.href = '/home';
    } catch (err) {
      setUi((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Error en el registro. Por favor, intenta de nuevo.',
      }));
      console.error('Error de registro:', err);
    } finally {
      setUi((prev) => ({ ...prev, loading: false }));
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
                      value={form.nombre}
                      onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
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

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Contraseña
              </label>
              <input
                  id="confirmPassword"
                  type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Repite tu contraseña"
                  required
                  minLength="8"
                  className="form-input"
              />
            </div>

            {ui.error && <div className="register-error">{ui.error}</div>}
            {ui.success && <div className="register-success">{ui.success}</div>}

            <button
                type="submit"
                disabled={ui.loading}
                className="register-button"
            >
              {ui.loading ? 'Registrando...' : 'Crear Cuenta'}
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

