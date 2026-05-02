import { isAuthenticated } from '../auth';

export function Landing() {
  const authAwarePath = (path) => (isAuthenticated() ? '/home' : path);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <h1 style={styles.logoText}>🏠 Compra Tu Hogar</h1>
          </div>
          <div style={styles.headerBtns}>
            <a href={authAwarePath('/login')} style={styles.loginLink}>Iniciar Sesión</a>
            <a href={authAwarePath('/register')} style={styles.registerBtn}>Registrarse</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h2 style={styles.heroTitle}>Encuentra Tu Hogar Ideal</h2>
          <p style={styles.heroSubtitle}>
            Descubre miles de propiedades y realiza tu compra de manera segura y confiable
          </p>
          <div style={styles.heroBtns}>
            <a href={authAwarePath('/register')} style={styles.heroBtn}>Comenzar Ahora</a>
            <a href="#features" style={styles.heroSecondaryBtn}>Saber Más</a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>¿Por qué Compra Tu Hogar?</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔍</div>
            <h3 style={styles.featureTitle}>Búsqueda Avanzada</h3>
            <p style={styles.featureText}>
              Filtra propiedades por ubicación, precio, tipo y más características
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⭐</div>
            <h3 style={styles.featureTitle}>Reseñas Verificadas</h3>
            <p style={styles.featureText}>
              Lee opiniones de compradores verificados sobre propiedades
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🛡️</div>
            <h3 style={styles.featureTitle}>Seguridad Garantizada</h3>
            <p style={styles.featureText}>
              Transacciones seguras con garantía de cumplimiento
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💰</div>
            <h3 style={styles.featureTitle}>Mejores Precios</h3>
            <p style={styles.featureText}>
              Acceso a ofertas exclusivas de inmobiliarias directas
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📱</div>
            <h3 style={styles.featureTitle}>Disponible 24/7</h3>
            <p style={styles.featureText}>
              Busca y compra desde cualquier dispositivo, en cualquier momento
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🤝</div>
            <h3 style={styles.featureTitle}>Soporte Premium</h3>
            <p style={styles.featureText}>
              Equipo de atención dedicado para ayudarte en todo el proceso
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.statsContent}>
          <div style={styles.statItem}>
            <h3 style={styles.statNumber}>5,234+</h3>
            <p style={styles.statLabel}>Propiedades Disponibles</p>
          </div>
          <div style={styles.statItem}>
            <h3 style={styles.statNumber}>1,280+</h3>
            <p style={styles.statLabel}>Compradores Satisfechos</p>
          </div>
          <div style={styles.statItem}>
            <h3 style={styles.statNumber}>450+</h3>
            <p style={styles.statLabel}>Inmobiliarias Asociadas</p>
          </div>
          <div style={styles.statItem}>
            <h3 style={styles.statNumber}>$2.5B+</h3>
            <p style={styles.statLabel}>En Transacciones</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>¿Listo para Encontrar Tu Hogar?</h2>
          <p style={styles.ctaText}>
            Únete a miles de usuarios que ya encontraron su hogar ideal
          </p>
          <a href={authAwarePath('/register')} style={styles.ctaBtn}>Crear Cuenta Gratis</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerColumn}>
            <h4 style={styles.footerTitle}>Compra Tu Hogar</h4>
            <p style={styles.footerText}>
              La plataforma número uno para encontrar tu hogar ideal
            </p>
          </div>
          <div style={styles.footerColumn}>
            <h4 style={styles.footerTitle}>Enlaces</h4>
            <a href="#" style={styles.footerLink}>Propiedades</a>
            <a href="#" style={styles.footerLink}>Favoritos</a>
            <a href="#" style={styles.footerLink}>Soporte</a>
          </div>
          <div style={styles.footerColumn}>
            <h4 style={styles.footerTitle}>Legal</h4>
            <a href="#" style={styles.footerLink}>Términos de Uso</a>
            <a href="#" style={styles.footerLink}>Privacidad</a>
            <a href="#" style={styles.footerLink}>Cookies</a>
          </div>
          <div style={styles.footerColumn}>
            <h4 style={styles.footerTitle}>Síguenos</h4>
            <div style={styles.socialLinks}>
              <a href="#" style={styles.socialLink}>Facebook</a>
              <a href="#" style={styles.socialLink}>Twitter</a>
              <a href="#" style={styles.socialLink}>Instagram</a>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.footerBottomText}>
            © 2026 Compra Tu Hogar. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Header
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
  },

  // Hero Section
  hero: {
    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    color: 'white',
    padding: '120px 20px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    maxWidth: '900px',
    margin: '0 auto',
    position: 'relative',
    zIndex: '2',
  },
  heroTitle: {
    fontSize: '56px',
    fontWeight: '800',
    marginBottom: '16px',
    margin: '0 0 16px 0',
    lineHeight: '1.2',
  },
  heroSubtitle: {
    fontSize: '20px',
    opacity: '0.95',
    marginBottom: '40px',
    margin: '0 0 40px 0',
    lineHeight: '1.6',
  },
  heroBtns: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  heroBtn: {
    padding: '16px 40px',
    fontSize: '18px',
    fontWeight: '700',
    backgroundColor: 'white',
    color: '#007bff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'transform 0.3s, box-shadow 0.3s',
    display: 'inline-block',
  },
  heroSecondaryBtn: {
    padding: '16px 40px',
    fontSize: '18px',
    fontWeight: '700',
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.3s',
    display: 'inline-block',
  },

  // Features Section
  featuresSection: {
    padding: '80px 20px',
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: '42px',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '60px',
    color: '#222',
    margin: '0 0 60px 0',
  },
  featuresGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
  },
  featureCard: {
    backgroundColor: 'white',
    padding: '40px 24px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  featureIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#222',
    margin: '0 0 12px 0',
  },
  featureText: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
    margin: '0',
  },

  // Stats Section
  statsSection: {
    padding: '80px 20px',
    backgroundColor: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    color: '#222',
  },
  statsContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    textAlign: 'center',
  },
  statItem: {
    padding: '20px',
  },
  statNumber: {
    fontSize: '48px',
    fontWeight: '800',
    marginBottom: '8px',
    margin: '0 0 8px 0',
    color: '#222',
  },
  statLabel: {
    fontSize: '16px',
    opacity: '0.95',
    margin: '0',
  },

  // CTA Section
  ctaSection: {
    padding: '80px 20px',
    textAlign: 'center',
  },
  ctaContent: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: '42px',
    fontWeight: '800',
    marginBottom: '16px',
    color: '#222',
    margin: '0 0 16px 0',
  },
  ctaText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '32px',
    margin: '0 0 32px 0',
    lineHeight: '1.6',
  },
  ctaBtn: {
    padding: '16px 48px',
    fontSize: '18px',
    fontWeight: '700',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.3s',
    display: 'inline-block',
  },

  // Footer
  footer: {
    backgroundColor: '#222',
    color: '#ccc',
    padding: '60px 20px 20px',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    marginBottom: '40px',
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  footerTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  footerText: {
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0',
  },
  footerLink: {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.3s',
  },
  socialLinks: {
    display: 'flex',
    gap: '12px',
    flexDirection: 'column',
  },
  socialLink: {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.3s',
  },
  footerBottom: {
    borderTop: '1px solid #444',
    paddingTop: '20px',
    textAlign: 'center',
  },
  footerBottomText: {
    fontSize: '14px',
    color: '#999',
    margin: '0',
  },
};

















