import { useState } from 'react';
import { logout, getUserName, getUserRole } from '../auth';

const stats = [
  { icon: '🏠', value: '5,234', label: 'Propiedades Disponibles' },
  { icon: '👥', value: '1,280', label: 'Compradores Satisfechos' },
  { icon: '⭐', value: '4.8/5', label: 'Calificación Promedio' },
  { icon: '💰', value: '$2.5M', label: 'Ventas Este Mes' },
];

const properties = Array.from({ length: 6 }, (_, index) => index + 1);

export function Home() {
  const userName = getUserName() || 'Usuario';
  const userRole = getUserRole();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isAdmin = userRole === 'administrador';
  const isInmobiliaria = userRole === 'inmobiliaria';

  const getRoleLabel = () => {
    if (isAdmin) return '👑 Administrador';
    if (isInmobiliaria) return '🏢 Inmobiliaria';
    return '👤 Comprador';
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-header-content">
          <div className="home-logo">
            <h1 className="home-logo-text">🏠 Compra Tu Hogar</h1>
          </div>

          <nav className="home-nav" aria-label="Navegación principal">
            <a href="#" className="home-nav-link">Propiedades</a>
            <a href="#" className="home-nav-link">Favoritos</a>
            <a href="#" className="home-nav-link">Mi Perfil</a>
            {isAdmin && <a href="/admin" className="home-nav-link home-panel-link">Panel Admin</a>}
            {isInmobiliaria && <a href="/inmobiliaria" className="home-nav-link home-panel-link">Panel Inmobiliaria</a>}
            <button type="button" className="home-logout-btn" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </nav>

          <button
            type="button"
            className="home-menu-btn"
            onClick={() => setIsMenuOpen((value) => !value)}
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
          >
            ☰
          </button>
        </div>

        <div className={`home-mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <a href="#" className="home-mobile-link">Propiedades</a>
          <a href="#" className="home-mobile-link">Favoritos</a>
          <a href="#" className="home-mobile-link">Mi Perfil</a>
          {isAdmin && <a href="/admin" className="home-mobile-link home-mobile-panel-link">Panel Admin</a>}
          {isInmobiliaria && <a href="/inmobiliaria" className="home-mobile-link home-mobile-panel-link">Panel Inmobiliaria</a>}
          <button type="button" className="home-mobile-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero-content">
          <h2 className="home-hero-title">¡Bienvenido, {userName}!</h2>
          <p className="home-hero-subtitle">Encuentra tu hogar ideal entre miles de propiedades</p>
          <button type="button" className="home-hero-btn">Explorar Propiedades</button>
        </div>
      </section>

      <section className="home-stats">
        <div className="home-stats-container">
          {stats.map((stat) => (
            <div key={stat.label} className="home-stat-card">
              <div className="home-stat-icon">{stat.icon}</div>
              <h3 className="home-stat-title">{stat.value}</h3>
              <p className="home-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-featured">
        <h2 className="home-section-title">Propiedades Destacadas</h2>
        <div className="home-properties-grid">
          {properties.map((property) => (
            <div key={property} className="home-property-card">
              <div className="home-property-image">
                <div className="home-image-placeholder">{property}</div>
                <div className="home-price-tag">$125,000</div>
              </div>
              <div className="home-property-info">
                <h3 className="home-property-title">Propiedad {property} - Departamento</h3>
                <p className="home-property-location">📍 Palermo, CABA</p>
                <div className="home-property-details">
                  <span>🛏️ 3 Ambientes</span>
                  <span>🚿 2 Baños</span>
                  <span>📐 120m²</span>
                </div>
                <button type="button" className="home-property-btn">Ver Detalles</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-info-section">
        <div className="home-info-banner">
          <h3 className="home-info-banner-title">Tu Perfil</h3>
          <p className="home-info-banner-text"><strong>Nombre:</strong> {userName}</p>
          <p className="home-info-banner-text"><strong>Rol:</strong> {getRoleLabel()}</p>
          <p className="home-info-banner-text"><strong>Estado:</strong> ✅ Verificado</p>
        </div>
      </section>

      <footer className="home-footer">
        <p className="home-footer-text">© 2026 Compra Tu Hogar. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
