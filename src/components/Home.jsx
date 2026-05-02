import { logout, getUserName, getUserRole } from '../auth';
import { useState } from 'react';

export function Home() {
  const userName = getUserName();
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
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <h1 style={styles.logoText}>🏠 Compra Tu Hogar</h1>
          </div>
          <nav style={styles.nav}>
            <a href="#" style={styles.navLink}>Propiedades</a>
            <a href="#" style={styles.navLink}>Favoritos</a>
            <a href="#" style={styles.navLink}>Mi Perfil</a>
            {isAdmin && (
              <a href="/admin" style={styles.navPanelBtn}>Panel Admin</a>
            )}
            {isInmobiliaria && (
              <a href="/inmobiliaria" style={styles.navPanelBtn}>Panel Inmobiliaria</a>
            )}
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </nav>
          <button
            style={styles.menuBtn}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
        {isMenuOpen && (
          <div style={styles.mobileMenu}>
            <a href="#" style={styles.mobileLink}>Propiedades</a>
            <a href="#" style={styles.mobileLink}>Favoritos</a>
            <a href="#" style={styles.mobileLink}>Mi Perfil</a>
            {isAdmin && (
              <a href="/admin" style={styles.mobilePanelBtn}>Panel Admin</a>
            )}
            {isInmobiliaria && (
              <a href="/inmobiliaria" style={styles.mobilePanelBtn}>Panel Inmobiliaria</a>
            )}
            <button style={styles.mobileLogoutBtn} onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        )}
      </header>

      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h2 style={styles.heroTitle}>¡Bienvenido, {userName}!</h2>
          <p style={styles.heroSubtitle}>
            Encuentra tu hogar ideal entre miles de propiedades
          </p>
          <button style={styles.heroBtn}>Explorar Propiedades</button>
        </div>
      </section>

      <section style={styles.statsSection}>
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏠</div>
            <h3 style={styles.statTitle}>5,234</h3>
            <p style={styles.statLabel}>Propiedades Disponibles</p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <h3 style={styles.statTitle}>1,280</h3>
            <p style={styles.statLabel}>Compradores Satisfechos</p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⭐</div>
            <h3 style={styles.statTitle}>4.8/5</h3>
            <p style={styles.statLabel}>Calificación Promedio</p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <h3 style={styles.statTitle}>$2.5M</h3>
            <p style={styles.statLabel}>Ventas Este Mes</p>
          </div>
        </div>
      </section>

      <section style={styles.featuredSection}>
        <h2 style={styles.sectionTitle}>Propiedades Destacadas</h2>
        <div style={styles.propertiesGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={styles.propertyCard}>
              <div style={styles.propertyImage}>
                <div style={styles.imagePlaceholder}>{i}</div>
                <div style={styles.priceTag}>$125,000</div>
              </div>
              <div style={styles.propertyInfo}>
                <h3 style={styles.propertyTitle}>
                  Propiedad {i} - Departamento
                </h3>
                <p style={styles.propertyLocation}>📍 Palermo, CABA</p>
                <div style={styles.propertyDetails}>
                  <span>🛏️ 3 Ambientes</span>
                  <span>🚿 2 Baños</span>
                  <span>📐 120m²</span>
                </div>
                <button style={styles.propertyBtn}>Ver Detalles</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.infoSection}>
        <div style={styles.infoBanner}>
          <h3 style={styles.infoBannerTitle}>Tu Perfil</h3>
          <p style={styles.infoBannerText}>
            <strong>Nombre:</strong> {userName}
          </p>
          <p style={styles.infoBannerText}>
            <strong>Rol:</strong> {getRoleLabel()}
          </p>
          <p style={styles.infoBannerText}>
            <strong>Estado:</strong> ✅ Verificado
          </p>
        </div>
      </section>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © 2026 Compra Tu Hogar. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f8f9fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: '0',
    zIndex: '1000',
    width: '100%',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    width: '100%',
    height: '70px',
    boxSizing: 'border-box',
  },
  logo: {
    flex: '1',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    margin: '0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#007bff',
    whiteSpace: 'nowrap',
  },
  nav: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  navLink: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '6px',
    transition: 'background-color 0.3s',
    cursor: 'pointer',
    fontSize: '14px',
  },
  logoutBtn: {
    textDecoration: 'none',
    color: 'white',
    fontWeight: '700',
    padding: '10px 24px',
    backgroundColor: '#007bff',
    borderRadius: '6px',
    transition: 'background-color 0.3s',
    display: 'inline-block',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  },
  menuBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'none',
  },
  mobileMenu: {
    display: 'none',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #eee',
  },
  mobileLink: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '14px',
  },
  mobileLogoutBtn: {
    padding: '12px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
  },

  hero: {
    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    color: 'white',
    padding: '80px 20px',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '700',
    margin: '0 0 16px 0',
    lineHeight: '1.2',
  },
  heroSubtitle: {
    fontSize: '20px',
    margin: '0 0 32px 0',
    opacity: '0.95',
    lineHeight: '1.5',
  },
  heroBtn: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '700',
    backgroundColor: 'white',
    color: '#007bff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  navPanelBtn: {
    textDecoration: 'none',
    color: 'white',
    fontWeight: '700',
    backgroundColor: '#28a745',
    padding: '10px 16px',
    fontSize: '13px',
    borderRadius: '6px',
    display: 'inline-block',
  },
  mobilePanelBtn: {
    padding: '12px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
  },

  statsSection: {
    padding: '60px 20px',
    backgroundColor: 'white',
    width: '100%',
  },
  statsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
  },
  statCard: {
    textAlign: 'center',
    padding: '32px 24px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
  },
  statIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  statTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#007bff',
    margin: '0 0 8px 0',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    margin: '0',
  },

  featuredSection: {
    padding: '60px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '40px',
    textAlign: 'center',
    color: '#222',
  },
  propertiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    width: '100%',
  },
  propertyCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
  },
  propertyImage: {
    position: 'relative',
    height: '200px',
    backgroundColor: '#e9ecef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    fontSize: '60px',
    fontWeight: 'bold',
    color: '#adb5bd',
  },
  priceTag: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '14px',
  },
  propertyInfo: {
    padding: '20px',
  },
  propertyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#222',
  },
  propertyLocation: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 12px 0',
  },
  propertyDetails: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    fontSize: '13px',
    color: '#555',
  },
  propertyBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },

  infoSection: {
    padding: '40px 20px',
    backgroundColor: 'white',
    width: '100%',
  },
  infoBanner: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#e7f3ff',
    borderRadius: '12px',
    borderLeft: '4px solid #007bff',
  },
  infoBannerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 16px 0',
    color: '#0056b3',
  },
  infoBannerText: {
    fontSize: '14px',
    color: '#333',
    margin: '0 0 8px 0',
  },

  footer: {
    backgroundColor: '#222',
    color: 'white',
    textAlign: 'center',
    padding: '24px 20px',
    marginTop: '40px',
    width: '100%',
  },
  footerText: {
    margin: '0',
    fontSize: '14px',
  },
};













