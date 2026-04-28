import { logout } from '../auth';
import '../styles/components/admin.css';

export function AdminPanel() {
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-badge">ADMIN</div>
        <h1 className="admin-title">Panel de Administrador</h1>
        <p className="admin-text">
          Bienvenido. Desde aquí podrás administrar usuarios, inmobiliarias y reportes globales.
        </p>
        <button type="button" className="admin-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}




