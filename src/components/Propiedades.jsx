import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  obtenerPublicaciones,
} from '../auth';
import '../styles/components/properties.css';

const initialReviewForm = {
  puntaje: 5,
  comentario: '',
};

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

function getPublicacionLabel(publicacion) {
  const propiedad = publicacion?.propiedad;
  const tipo = propiedad?.tipo ? String(propiedad.tipo).toLowerCase() : 'propiedad';
  const ubicacion = propiedad?.ubicacion || 'Ubicación no disponible';
  const inmobiliaria = publicacion?.inmobiliaria?.nombre || 'Inmobiliaria';

  return `${tipo} en ${ubicacion} · ${inmobiliaria}`;
}

export function Propiedades() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [pendingAction, setPendingAction] = useState({ type: '', id: null });
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [successPropertyName, setSuccessPropertyName] = useState('');



  const publicacionesAgrupadas = useMemo(() => {
    const grupos = new Map();

    publicaciones.forEach((publicacion) => {
      const propiedad = publicacion?.propiedad;
      const key = propiedad?.id ?? publicacion?.id;

      if (!grupos.has(key)) {
        grupos.set(key, {
          propiedad,
          publicaciones: [],
        });
      }

      grupos.get(key).publicaciones.push(publicacion);
    });

    return Array.from(grupos.values()).sort((a, b) => {
      const aUbicacion = String(a.propiedad?.ubicacion || '').toLowerCase();
      const bUbicacion = String(b.propiedad?.ubicacion || '').toLowerCase();
      return aUbicacion.localeCompare(bUbicacion, 'es');
    });
  }, [publicaciones]);

  const patchPublication = (publicacionId, updater) => {
    setPublicaciones((prev) => prev.map((pub) => (pub.id === publicacionId ? updater(pub) : pub)));
  };

  const loadPublicaciones = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await obtenerPublicaciones();
      setPublicaciones(Array.isArray(data) ? data : data?.content || []);

      // no auto-seleccionamos; el detalle se muestra en su propia página
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  };

  // El detalle ahora se muestra en su propia ruta; no cargamos detalles aquí.

  useEffect(() => {
    void loadPublicaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const navigate = useNavigate();

  const selectPublication = (publicacion) => {
    // Ahora navegamos a la página de detalle de la publicación
    navigate(`/propiedades/${publicacion.id}`);
  };

  const isPending = (type, id) => pendingAction.type === type && pendingAction.id === id;

  const toggleFavorito = async (publicacion) => {
    setPendingAction({ type: 'favorito', id: publicacion.id });
    setError('');
    setStatusMessage('');

    try {
      if (publicacion.metadata.esFavorito) {
        await eliminarFavorito(publicacion.id);
      } else {
        await agregarFavorito(publicacion.id);
      }

      patchPublication(publicacion.id, (current) => ({
        ...current,
        esFavorito: !current.esFavorito,
      }));

      setStatusMessage(
        publicacion.metadata.esFavorito ? 'Se eliminó de favoritos.' : 'Se agregó a favoritos.',
      );
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el favorito');
    } finally {
      setPendingAction({ type: '', id: null });
    }
  };

  const handleComprar = async (publicacion) => {
    if (publicacion?.propiedad?.vendida) return;

    setPendingAction({ type: 'comprar', id: publicacion.id });
    setError('');
    setStatusMessage('');

    try {
      await comprarPublicacion(publicacion.id);
      setSuccessPropertyName(getPublicacionLabel(publicacion));
      setPurchaseSuccess(true);
      setStatusMessage('Compra realizada exitosamente.');
      await loadPublicaciones();
    } catch (err) {
      setError(err.message || 'No se pudo completar la compra');
    } finally {
      setPendingAction({ type: '', id: null });
    }
  };

  // Las acciones de reseñas ahora se manejan en la página de detalle

  return (
    <div className="properties-page">
      <header className="properties-header">
        <div>
          <p className="properties-eyebrow">Catálogo de publicaciones</p>
          <h1 className="properties-title">Propiedades disponibles</h1>
          <p className="properties-subtitle">
            Cada propiedad puede tener varias publicaciones de diferentes inmobiliarias.
          </p>
        </div>

        <div className="properties-header-actions">
          <Link to="/home" className="properties-back-link">
            Volver al Home
          </Link>
        </div>
      </header>

      {(error || statusMessage) && (
        <section className="properties-messages">
          {error && <div className="properties-error">{error}</div>}
          {statusMessage && <div className="properties-success">{statusMessage}</div>}
        </section>
      )}

      {loading ? (
        <div className="properties-state-card">Cargando publicaciones...</div>
      ) : publicacionesAgrupadas.length === 0 ? (
        <div className="properties-state-card">No hay publicaciones disponibles por el momento.</div>
      ) : (
        <div className="properties-layout">
          <section className="properties-list">
            {publicacionesAgrupadas.map(({ propiedad, publicaciones: publicacionesDeLaPropiedad }) => (
              <article key={propiedad?.id || publicacionesDeLaPropiedad[0]?.id} className="property-group-card">
                <div className="property-group-header">
                  <div>
                    <p className="property-group-label">Propiedad #{propiedad?.id ?? '—'}</p>
                    <h2 className="property-group-title">{propiedad?.ubicacion || 'Ubicación no disponible'}</h2>
                    <p className="property-group-meta">
                      {propiedad?.tipo || 'Tipo no informado'}
                      {propiedad?.piso ? ` · Piso ${propiedad.piso}` : ''}
                      {propiedad?.depto ? ` · Depto ${propiedad.depto}` : ''}
                    </p>
                  </div>

                  <div className={`property-status ${propiedad?.vendida ? 'sold' : 'available'}`}>
                    {propiedad?.vendida ? 'Vendida' : 'Disponible'}
                  </div>
                </div>

                <div className="property-group-specs">
                  <span>{propiedad?.superficie ?? '—'} m²</span>
                  <span>
                    {propiedad?.ambientes ?? '—'}{' '}
                    {propiedad?.ambientes === 1 ? 'ambiente' : 'ambientes'}
                  </span>
                  <span>
                    {propiedad?.sanitarios ?? '—'}{' '}
                    {propiedad?.sanitarios === 1 ? 'baño' : 'baños'}
                  </span>
                  <span>{propiedad?.expensas != null ? formatCurrency(propiedad.expensas) : 'Sin expensas'}</span>
                </div>

                {Array.isArray(propiedad?.caracteristicas) && propiedad.caracteristicas.length > 0 && (
                  <div className="property-group-chips">
                    {Array.from(propiedad.caracteristicas).map((caracteristica) => (
                      <span key={caracteristica} className="property-chip">
                        {caracteristica}
                      </span>
                    ))}
                  </div>
                )}

                {/* Mostrar una sola tarjeta por propiedad: elegir la publicación de menor precio como principal */}
                {(() => {
                  const pubs = publicacionesDeLaPropiedad || [];
                  const count = pubs.length;
                  const prices = pubs.map((p) => Number(p.precio) || 0).filter((v) => Number.isFinite(v));
                  const minPrice = prices.length ? Math.min(...prices) : null;
                  const maxPrice = prices.length ? Math.max(...prices) : null;
                  // elegir publicación con precio mínimo
                  const primaryPub = pubs.slice().sort((a, b) => (Number(a.precio) || 0) - (Number(b.precio) || 0))[0] || pubs[0];
                  const imagenPrincipal = Array.isArray(primaryPub?.imagenes) ? primaryPub.imagenes[0] : '';

                  const priceLabel = minPrice != null && maxPrice != null
                    ? (minPrice === maxPrice ? formatCurrency(minPrice) : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`)
                    : 'Precio no disponible';

                  const inmobiliariasLabel = count === 1 ? '1 inmobiliaria' : `${count} inmobiliarias`;
                  const availabilityLabel = propiedad?.vendida
                    ? `Estaba disponible con ${inmobiliariasLabel}`
                    : count > 1
                      ? `Disponible con ${inmobiliariasLabel}`
                      : 'Oferta única';

                  return (
                    <article className="property-card-summary" onClick={() => navigate(`/propiedades/propiedad/${propiedad?.id}`)} role="button" tabIndex={0}>
                      <div className="publication-image-wrap">
                        {imagenPrincipal ? (
                          <img src={imagenPrincipal} alt={`Foto principal propiedad ${propiedad?.id}`} className="publication-image" />
                        ) : (
                          <div className="publication-image-placeholder">Sin imagen</div>
                        )}
                        <div className="publication-price">{priceLabel}</div>
                      </div>

                      <div className="publication-content">
                        <div className="publication-topline">
                          <span className="publication-inmobiliaria">{primaryPub?.inmobiliaria?.nombre || 'Inmobiliaria'}</span>
                          <span className="publication-badge">{availabilityLabel}</span>
                        </div>

                        <h3 className="publication-title">{propiedad?.tipo ? `${propiedad.tipo} en ${propiedad.ubicacion}` : (propiedad?.ubicacion || 'Ubicación no disponible')}</h3>
                        <p className="publication-description">{primaryPub?.descripcion || ''}</p>

                        <div className="publication-actions">
                          <button type="button" className="properties-action-button primary" onClick={(e) => { e.stopPropagation(); navigate(`/propiedades/propiedad/${propiedad?.id}`); }}>
                            Ver opciones y fotos
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })()}
              </article>
            ))}
          </section>

          {purchaseSuccess && (
            <div className="properties-modal-overlay" onClick={() => setPurchaseSuccess(false)}>
              <div className="properties-modal" onClick={(e) => e.stopPropagation()}>
                <div className="properties-modal-header">
                  <h2 className="properties-modal-title">¡Compra realizada con éxito! 🎉</h2>
                </div>
                <div className="properties-modal-content">
                  <p>
                    Has comprado exitosamente la propiedad:
                  </p>
                  <p className="properties-modal-property-name">{successPropertyName}</p>
                  <p>
                    La propiedad ahora aparece como vendida en el catálogo.
                  </p>
                </div>
                <div className="properties-modal-footer">
                  <button
                    type="button"
                    className="properties-action-button primary"
                    onClick={() => setPurchaseSuccess(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* El panel de detalle fue movido a la ruta individual de publicación */}
        </div>
      )}
    </div>
  );
}





