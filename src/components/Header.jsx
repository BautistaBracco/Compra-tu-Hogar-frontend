import { useState } from 'react';

export function Header({ isAuthenticated = false, userName = '', onLogout = null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.logo}>
          <h1 style={styles.logoText}>🏠 Compra Tu Hogar</h1>
        </div>

        {/* Desktop Navigation */}
        {isAuthenticated ? (
          <nav style={styles.nav}>
            <a href="#" style={styles.navLink}>Propiedades</a>
            <a href="#" style={styles.navLink}>Favoritos</a>
            <a href="#" style={styles.navLink}>Mi Perfil</a>
            <button style={styles.logoutBtn} onClick={onLogout}>
              Cerrar Sesión
            </button>
          </nav>
        ) : (
          <div style={styles.headerBtns}>
            <a href="/login" style={styles.loginLink}>Iniciar Sesión</a>
            <a href="/register" style={styles.registerBtn}>Registrarse</a>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          style={styles.menuBtn}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={styles.mobileMenu}>
          {isAuthenticated ? (
            <>
              <a href="#" style={styles.mobileLink}>Propiedades</a>
              <a href="#" style={styles.mobileLink}>Favoritos</a>
              <a href="#" style={styles.mobileLink}>Mi Perfil</a>
              <button style={styles.mobileLogoutBtn} onClick={onLogout}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <a href="/login" style={styles.mobileLink}>Iniciar Sesión</a>
              <a href="/register" style={styles.mobileLink}>Registrarse</a>
            </>
          )}
        </div>
      )}
    </header>
  );
}

const styles = {
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
  headerBtns: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
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
  loginLink: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '6px',
    transition: 'background-color 0.3s',
    cursor: 'pointer',
    fontSize: '14px',
  },
  registerBtn: {
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
};

