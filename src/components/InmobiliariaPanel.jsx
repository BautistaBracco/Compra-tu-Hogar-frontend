import { logout } from '../auth';
import '../styles/components/inmobiliaria.css';

export function InmobiliariaPanel() {
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

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

