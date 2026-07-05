import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eliminarFavorito, obtenerFavoritos } from '../auth';
import '../styles/components/favorites.css';

function formatCurrency(value) {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return '$0';

  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(numberValue);
  } catch {
    return `$${numberValue.toLocaleString('es-AR')}`;
  }
}

function getTitle(publicacion) {
  const ubicacion = publicacion?.propiedad?.ubicacion || 'Ubicación no disponible';
  const tipo = publicacion?.propiedad?.tipo || 'Propiedad';
  const inmobiliaria = publicacion?.inmobiliaria?.nombre || 'Inmobiliaria';
  return `${tipo} en ${ubicacion} · ${inmobiliaria}`;
}

export function Favoritos() {
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pendingId, setPendingId] = useState(null);

  const loadFavoritos = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await obtenerFavoritos();
      const rawData = Array.isArray(data) ? data : data?.content || [];

      // ORDENAMIENTO FIJO: Esto evita que cambien de lugar al recargar
      const ordenados = [...rawData].sort((a, b) => a.id - b.id);

      setFavoritos(ordenados);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFavoritos();
  }, []);

  const handleRemove = async (publicacion) => {
    setPendingId(publicacion.id);
    setError('');
    setMessage('');

    try {
      await eliminarFavorito(publicacion.id);
      setFavoritos((prev) => prev.filter((item) => item.id !== publicacion.id));
      setMessage('Se eliminó de favoritos.');
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el favorito');
    } finally {
      setPendingId(null);
    }
  };

  return (
      <div className="favorites-page">
        <header className="favorites-header">
          <div>
            <p className="favorites-eyebrow">Mis favoritos</p>
            <h1 className="favorites-title">Publicaciones guardadas</h1>
            <p className="favorites-subtitle">Todas las propiedades que marcaste como favoritas.</p>
          </div>

          <Link to="/home" className="favorites-back-link">
            Volver al Home
          </Link>
        </header>

        {(error || message) && (
            <section className="favorites-messages">
              {error && <div className="favorites-error">{error}</div>}
              {message && <div className="favorites-success">{message}</div>}
            </section>
        )}

        {loading ? (
            <div className="favorites-state-card">Cargando favoritos...</div>
        ) : favoritos.length === 0 ? (
            <div className="favorites-state-card">
              Todavía no tenés favoritos guardados.
              <div className="favorites-empty-actions">
                <button type="button" className="favorites-primary-btn" onClick={() => navigate('/propiedades')}>
                  Ir a propiedades
                </button>
              </div>
            </div>
        ) : (
            <div className="favorites-grid">
              {favoritos.map((publicacion) => {
                const imagenPrincipal = Array.isArray(publicacion.imagenes) ? publicacion.imagenes[0] : '';

                return (
                    <article key={publicacion.id} className="favorites-card">
                      <div className="favorites-image-wrap">
                        {imagenPrincipal ? (
                            <img src={imagenPrincipal} alt={getTitle(publicacion)} className="favorites-image" />
                        ) : (
                            <div className="favorites-image-placeholder">Sin imagen</div>
                        )}
                        <div className="favorites-price">{formatCurrency(publicacion.precio)}</div>
                      </div>

                      <div className="favorites-content">
                        <h2 className="favorites-card-title">{getTitle(publicacion)}</h2>
                        <p className="favorites-card-description">{publicacion.descripcion}</p>

                        <div className="favorites-meta">
                          <span>{publicacion?.propiedad?.ambientes ?? '—'} ambientes</span>
                          <span>{publicacion?.propiedad?.superficie ?? '—'} m²</span>
                          <span>{publicacion?.propiedad?.vendida ? 'Vendida' : 'Disponible'}</span>
                        </div>

                        <div className="favorites-actions">
                          <button
                              type="button"
                              className="favorites-remove-btn"
                              onClick={() => handleRemove(publicacion)}
                              disabled={pendingId === publicacion.id}
                          >
                            {pendingId === publicacion.id ? 'Quitando...' : 'Quitar favorito'}
                          </button>
                          <button
                              type="button"
                              className="favorites-secondary-btn"
                              onClick={() => navigate(`/propiedades/propiedad/${publicacion.propiedad.id}?offerId=${publicacion.id}`)}
                          >
                            Ver en propiedades
                          </button>
                        </div>
                      </div>
                    </article>
                );
              })}
            </div>
        )}
      </div>
  );
}
