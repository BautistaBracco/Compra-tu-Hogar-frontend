import { isAuthenticated } from '../auth';

const featureCards = [
  {
    icon: '🔍',
    title: 'Búsqueda Avanzada',
    text: 'Filtra propiedades por ubicación, precio, tipo y más características',
  },
  {
    icon: '⭐',
    title: 'Reseñas Verificadas',
    text: 'Lee opiniones de compradores verificados sobre propiedades',
  },
  {
    icon: '🛡️',
    title: 'Seguridad Garantizada',
    text: 'Transacciones seguras con garantía de cumplimiento',
  },
  {
    icon: '💰',
    title: 'Mejores Precios',
    text: 'Acceso a ofertas exclusivas de inmobiliarias directas',
  },
  {
    icon: '📱',
    title: 'Disponible 24/7',
    text: 'Busca y compra desde cualquier dispositivo, en cualquier momento',
  },
  {
    icon: '🤝',
    title: 'Soporte Premium',
    text: 'Equipo de atención dedicado para ayudarte en todo el proceso',
  },
];

export function Landing() {
  const authAwarePath = (path) => (isAuthenticated() ? '/home' : path);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-header-content">
          <div className="landing-logo">
            <h1 className="landing-logo-text">🏠 Compra Tu Hogar</h1>
          </div>
          <div className="landing-header-actions">
            <a href={authAwarePath('/login')} className="landing-login-link">Iniciar Sesión</a>
            <a href={authAwarePath('/register')} className="landing-register-btn">Registrarse</a>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <h2 className="landing-hero-title">Encuentra Tu Hogar Ideal</h2>
          <p className="landing-hero-subtitle">
            Descubre miles de propiedades y realiza tu compra de manera segura y confiable
          </p>
          <div className="landing-buttons">
            <a href={authAwarePath('/register')} className="landing-btn-primary">Comenzar Ahora</a>
            <button type="button" className="landing-btn-secondary" onClick={scrollToFeatures}>
              Saber Más
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="landing-features">
        <div className="landing-features-container">
          <h2 className="landing-features-title">¿Por qué Compra Tu Hogar?</h2>
          <div className="landing-features-grid">
            {featureCards.map((card) => (
              <article key={card.title} className="landing-feature-card">
                <div className="landing-feature-icon">{card.icon}</div>
                <h3 className="landing-feature-title">{card.title}</h3>
                <p className="landing-feature-text">{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta-content">
          <h2 className="landing-cta-title">¿Listo para Encontrar Tu Hogar?</h2>
          <p className="landing-cta-text">
            Únete a miles de usuarios que ya encontraron su hogar ideal
          </p>
          <a href={authAwarePath('/register')} className="landing-cta-btn">Crear Cuenta Gratis</a>
        </div>
      </section>

      <footer className="landing-footer">
        <p className="landing-footer-text">© 2026 Compra Tu Hogar. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
