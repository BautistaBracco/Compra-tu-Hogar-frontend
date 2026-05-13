import { logout } from '../auth';
import { useEffect } from 'react';
import '../styles/components/inmobiliaria.css';

export function InmobiliariaPanel() {
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  useEffect(() => {
    document.body.classList.add('panel-inmobiliaria-no-scrollbar');

    return () => {
      document.body.classList.remove('panel-inmobiliaria-no-scrollbar');
    };
  }, []);

  return (
    <div className="inmobiliaria-container">
      <div className="inmobiliaria-card">
        <div className="inmobiliaria-badge">INMOBILIARIA</div>
        <h1 className="inmobiliaria-title">Panel de Inmobiliaria</h1>
        <p className="inmobiliaria-text">
          Bienvenido. Desde aquí podrás administrar tu catálogo de propiedades y ver tus ventas.
        </p>
        <button type="button" className="inmobiliaria-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

