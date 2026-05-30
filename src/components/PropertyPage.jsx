import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  agregarFavorito,
  agregarResena,
  comprarPublicacion,
  eliminarFavorito,
  eliminarResena,
  getUserId,
  obtenerPublicaciones,
  obtenerPublicacionPorId,
  obtenerResenasPublicacion,
} from '../auth';
import '../styles/components/properties.css';

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

const initialReviewForm = { puntaje: 5, comentario: '' };

export default function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicaciones, setPublicaciones] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [resenas, setResenas] = useState([]);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [pending, setPending] = useState({ type: '', id: null });

  const userId = Number(getUserId() || 0);

  const offers = useMemo(() => publicaciones || [], [publicaciones]);
  const property = useMemo(() => offers[0]?.propiedad || {}, [offers]);
  const priceRange = useMemo(() => {
    if (!offers.length) return { min: null, max: null };
    const prices = offers.map((offer) => Number(offer.precio) || 0).filter((value) => Number.isFinite(value));
    if (!prices.length) return { min: null, max: null };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [offers]);

  const currentImages = useMemo(() => {
    const imgs = Array.isArray(selectedOffer?.imagenes) ? selectedOffer.imagenes.filter(Boolean) : [];
    return imgs.length > 0 ? imgs : [];
  }, [selectedOffer]);

  const currentImage = currentImages[selectedImageIndex] || currentImages[0] || '';

  const loadOffers = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await obtenerPublicaciones();
      const pubs = Array.isArray(data) ? data : data?.content || [];
      const filtered = pubs.filter((p) => String(p.propiedad?.id) === String(id));
      const sorted = filtered.slice().sort((a, b) => (Number(a.precio) || 0) - (Number(b.precio) || 0));

      setPublicaciones(sorted);
      setSelectedOfferId(sorted[0]?.id ?? null);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!selectedOfferId) {
      setSelectedOffer(null);
      setResenas([]);
      return;
    }

    const loadDetail = async () => {
      setError('');
      try {
        const [detalle, listaResenas] = await Promise.all([
          obtenerPublicacionPorId(selectedOfferId),
          obtenerResenasPublicacion(selectedOfferId),
        ]);
        setSelectedOffer(detalle);
        setResenas(Array.isArray(listaResenas) ? listaResenas : []);
        setSelectedImageIndex(0);
      } catch (err) {
        setError(err.message || 'No se pudo cargar la publicación seleccionada');
      }
    };

    void loadDetail();
  }, [selectedOfferId]);

  const selectOffer = (offerId) => {
    setSelectedOfferId(offerId);
  };

  const handlePrevImage = () => {
    if (currentImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  const handleNextImage = () => {
    if (currentImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const handleComprar = async () => {
    if (!selectedOffer || selectedOffer.propiedad?.vendida) return;

    setPending({ type: 'comprar', id: selectedOffer.id });
    setError('');
    try {
      await comprarPublicacion(selectedOffer.id);
      await loadOffers();
    } catch (err) {
      setError(err.message || 'No se pudo completar la compra');
    } finally {
      setPending({ type: '', id: null });
    }
  };

  const handleToggleFavorito = async () => {
    if (!selectedOffer) return;

    setPending({ type: 'favorito', id: selectedOffer.id });
    setError('');
    try {
      if (selectedOffer.esFavorito) await eliminarFavorito(selectedOffer.id);
      else await agregarFavorito(selectedOffer.id);

      const detalle = await obtenerPublicacionPorId(selectedOffer.id);
      setSelectedOffer(detalle);
    } catch (err) {
      setError(err.message || 'No se pudo actualizar favorito');
    } finally {
      setPending({ type: '', id: null });
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!selectedOffer) return;

    const puntaje = Number(reviewForm.puntaje);
    if (!Number.isFinite(puntaje) || puntaje < 0 || puntaje > 10) {
      setError('El puntaje debe estar entre 0 y 10.');
      return;
    }

    setPending({ type: 'reseña', id: selectedOffer.id });
    setError('');
    try {
      await agregarResena(selectedOffer.id, {
        puntaje,
        comentario: reviewForm.comentario.trim() || null,
      });
      const listaResenas = await obtenerResenasPublicacion(selectedOffer.id);
      setResenas(Array.isArray(listaResenas) ? listaResenas : []);
      setReviewForm(initialReviewForm);
    } catch (err) {
      setError(err.message || 'No se pudo agregar la reseña');
    } finally {
      setPending({ type: '', id: null });
    }
  };

  const handleDeleteResena = async (resena) => {
    const confirmed = window.confirm('¿Querés borrar esta reseña?');
    if (!confirmed) return;

    setPending({ type: 'borrar-reseña', id: resena.id });
    setError('');
    try {
      await eliminarResena(resena.id);
      const listaResenas = await obtenerResenasPublicacion(selectedOffer.id);
      setResenas(Array.isArray(listaResenas) ? listaResenas : []);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la reseña');
    } finally {
      setPending({ type: '', id: null });
    }
  };

  if (loading) return <div className="properties-state-card">Cargando publicaciones...</div>;
  if (!offers.length) return <div className="properties-state-card">No se encontraron ofertas para esta propiedad.</div>;

  const selectedOfferName = selectedOffer?.inmobiliaria?.nombre || 'Inmobiliaria';
  const fixedTitle = property.tipo ? `${property.tipo} en ${property.ubicacion}` : (property.ubicacion || 'Propiedad');
  const hasMultipleOffers = offers.length > 1;
  const priceLabel = priceRange.min != null && priceRange.max != null
    ? (priceRange.min === priceRange.max ? formatCurrency(priceRange.min) : `${formatCurrency(priceRange.min)} - ${formatCurrency(priceRange.max)}`)
    : 'Precio no disponible';
  const expensasValue = Number(selectedOffer?.propiedad?.expensas);
  const showExpensas = Number.isFinite(expensasValue) && expensasValue > 0;

  // Formateo correcto singular/plural para la línea corta (subtítulo)
  const ambientesNum = property.ambientes != null && property.ambientes !== '' ? Number(property.ambientes) : null;
  const sanitariosNum = property.sanitarios != null && property.sanitarios !== '' ? Number(property.sanitarios) : null;
  const ambientesShort = ambientesNum == null ? '—' : (Number.isFinite(ambientesNum) ? `${ambientesNum} ${ambientesNum === 1 ? 'ambiente' : 'ambientes'}` : String(property.ambientes));
  const sanitariosShort = sanitariosNum == null ? '—' : (Number.isFinite(sanitariosNum) ? `${sanitariosNum} ${sanitariosNum === 1 ? 'baño' : 'baños'}` : String(property.sanitarios));

  return (
    <div className="properties-page properties-page-detail">
      <header className="properties-header properties-header-detail">
        <div className="properties-header-copy">
          <p className="properties-eyebrow">Propiedad</p>
          <h1 className="properties-title">{fixedTitle}</h1>
          <p className="properties-subtitle">
            {property.superficie
              ? `${property.superficie} m² · ${ambientesShort} · ${sanitariosShort}`
              : 'Datos generales de la propiedad'}
          </p>
        </div>

        <div className="properties-header-actions">
          <button type="button" className="properties-back-link" onClick={() => navigate('/propiedades')}>
            Volver a resultados
          </button>
        </div>
      </header>

      {error && (
        <section className="properties-messages">
          <div className="properties-error">{error}</div>
        </section>
      )}

      <div className="property-detail-shell">
        <section className="property-overview-card property-surface-card">
          <div className="property-overview-top">
            <div>
              <p className="properties-eyebrow">Datos generales</p>
              <h2 className="properties-section-title">Resumen de la propiedad</h2>
            </div>
            <div className={`property-price-range ${hasMultipleOffers ? '' : 'property-price-range--single'}`}>
              <span className="property-price-range-label">{hasMultipleOffers ? 'Rango de precios' : 'Precio'}</span>
              <strong>{priceLabel}</strong>
            </div>
          </div>

          <div className="property-overview-grid">
            <div className="property-overview-item"><span>M²</span><strong>{property.superficie ?? '—'}</strong></div>
            <div className="property-overview-item"><span>Ambientes</span><strong>{property.ambientes ?? '—'}</strong></div>
            <div className="property-overview-item"><span>Baños</span><strong>{property.sanitarios ?? '—'}</strong></div>
            <div className="property-overview-item"><span>Ubicación</span><strong>{property.ubicacion || '—'}</strong></div>
            <div className="property-overview-item"><span>Piso</span><strong>{property.piso || '—'}</strong></div>
            <div className="property-overview-item"><span>Depto</span><strong>{property.depto || '—'}</strong></div>
          </div>
        </section>

        <section className="property-offers-strip">
          <div className="property-section-heading">
            <div>
              <p className="properties-eyebrow">Selector de ofertas</p>
              <h2 className="properties-section-title">Elegí la inmobiliaria</h2>
            </div>
            <p className="property-section-hint">Al cambiar de oferta se actualizan fotos, precio, descripción y contacto.</p>
          </div>

          <div className="offers-selector">
            {offers.map((offer) => {
              const isActive = String(offer.id) === String(selectedOfferId);
              const thumb = Array.isArray(offer.imagenes) ? offer.imagenes[0] : '';

              return (
                <button
                  key={offer.id}
                  type="button"
                  className={`offer-tab ${isActive ? 'active' : ''}`}
                  onClick={() => selectOffer(offer.id)}
                >
                  <div className="offer-thumb">
                    {thumb ? <img src={thumb} alt={`Oferta ${offer.id}`} /> : <div className="publication-image-placeholder">Sin imagen</div>}
                  </div>

                  <div className="offer-info">
                    <div className="offer-agent">{offer.inmobiliaria?.nombre || 'Inmobiliaria'}</div>
                    <div className="offer-price">{formatCurrency(offer.precio)}</div>
                    <div className="offer-meta">{offer.esFavorito? 'En favoritos' : 'Ver oferta'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="property-detail-grid">
          <main className="property-main-column">
            <section className="property-gallery-card property-surface-card">
              <div className="property-gallery-hero">
                <div className="publication-image-wrap property-gallery-main property-media property-media--hero">
                  {currentImage ? (
                    <img src={currentImage} alt={`Publicación ${selectedOffer?.id}`} className="publication-image" />
                  ) : (
                    <div className="publication-image-placeholder">Sin imagen</div>
                  )}

                  {currentImages.length > 1 && (
                    <>
                      <div className="property-gallery-nav" aria-label="Navegación de imágenes">
                        <button
                          type="button"
                          className="property-gallery-arrow"
                          onClick={handlePrevImage}
                          aria-label="Imagen anterior"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="property-gallery-arrow"
                          onClick={handleNextImage}
                          aria-label="Imagen siguiente"
                        >
                          ›
                        </button>
                      </div>
                      <span className="property-gallery-counter">
                        {selectedImageIndex + 1}/{currentImages.length}
                      </span>
                    </>
                  )}

                  <div className="publication-price publication-price-large">{formatCurrency(selectedOffer?.precio)}</div>
                </div>
              </div>

              <div className="property-gallery-meta">
                <span className="property-gallery-agent">{selectedOfferName}</span>
                <span className="property-gallery-copy">
                  {offers.length > 1
                    ? `Disponible con ${offers.length} inmobiliarias (ver opciones y fotos)`
                    : 'Disponible con una inmobiliaria'}
                </span>
              </div>

              {/* La navegación de imágenes se hace con flechas en la parte superior */}
            </section>

            <section className="property-description-card property-surface-card">
              <div className="property-section-heading">
                <div>
                  <p className="properties-eyebrow">Descripción de la publicación</p>
                  <h2 className="properties-section-title">Contenido dinámico de la oferta</h2>
                </div>
                <p className="property-section-hint">Esta descripción cambia según la inmobiliaria seleccionada.</p>
              </div>

              <p className="property-description-text">
                {selectedOffer?.descripcion || 'Sin descripción disponible.'}
              </p>

              {showExpensas && (
                <div className="property-overview-item property-overview-item--compact property-overview-item--expensas">
                  <span>Expensas</span>
                  <strong>{formatCurrency(expensasValue)}</strong>
                </div>
              )}

              {Array.isArray(selectedOffer?.propiedad?.caracteristicas) && selectedOffer.propiedad.caracteristicas.length > 0 && (
                <div className="properties-detail-section properties-detail-section--characteristics">
                  <p className="properties-eyebrow">Características incluidas</p>
                  <div className="characteristics-list">
                    {selectedOffer.propiedad.caracteristicas.map((caracteristica, index) => (
                      <span key={index} className="characteristic-chip">
                        {caracteristica}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="property-contact-grid property-contact-grid--offer-summary">
                <div className="property-contact-card">
                  <span>Inmobiliaria</span>
                  <strong>{selectedOffer?.inmobiliaria?.nombre || '—'}</strong>
                </div>
                <div className="property-contact-card">
                  <span>Precio de esta oferta</span>
                  <strong>{formatCurrency(selectedOffer?.precio)}</strong>
                </div>
                <div className="property-contact-card">
                  <span>Estado</span>
                  <strong>{selectedOffer?.propiedad?.vendida ? 'Vendida' : 'Disponible'}</strong>
                </div>
              </div>
            </section>

            <section className="property-reviews-card property-surface-card">
              <div className="property-section-heading">
                <div>
                  <p className="properties-eyebrow">Comentarios y puntaje</p>
                  <h2 className="properties-section-title">Reseñas de esta oferta</h2>
                </div>
              </div>

              {resenas.length > 0 ? (
                <div className="reviews-list">
                  {resenas.map((resena) => (
                    <article key={resena.id} className="review-card">
                      <div className="review-card-header">
                        <div className="review-card-author">
                          <strong>{resena.autorNombre}</strong>
                          <span className="review-card-rating">⭐ {resena.puntaje}/10</span>
                        </div>

                        {Number(resena.autorId) === userId && (
                          <button
                            type="button"
                            className="review-delete-button"
                            onClick={() => handleDeleteResena(resena)}
                            disabled={pending.type === 'borrar-reseña'}
                          >
                            {pending.type === 'borrar-reseña' ? 'Borrando...' : 'Borrar'}
                          </button>
                        )}
                      </div>
                      <p>{resena.comentario || 'Sin comentario'}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="properties-empty-inline">Todavía no hay reseñas para esta publicación.</p>
              )}

              <form className="review-form review-form-card" onSubmit={handleReviewSubmit}>
                <label>
                  Puntaje (0 a 10)
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={reviewForm.puntaje}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, puntaje: e.target.value }))}
                    className="review-input"
                  />
                </label>

                <label>
                  Comentario
                  <textarea
                    value={reviewForm.comentario}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, comentario: e.target.value }))}
                    className="review-textarea"
                    rows="4"
                    placeholder="Escribí tu experiencia con esta oferta"
                  />
                </label>

                <button
                  type="submit"
                  className="properties-action-button primary full-width"
                  disabled={pending.type === 'reseña'}
                >
                  {pending.type === 'reseña' ? 'Guardando...' : 'Agregar reseña'}
                </button>
              </form>
            </section>
          </main>

          <aside className="property-sidebar">
            <div className="properties-detail-card property-surface-card property-sidebar-card">
              <div className="property-sidebar-title">
                <p className="properties-eyebrow">Oferta seleccionada</p>
                <h3 className="properties-section-title">{selectedOfferName}</h3>
              </div>

              <div className="property-sidebar-price">{formatCurrency(selectedOffer?.precio)}</div>

              <div className="property-sidebar-meta">
                <span>{selectedOffer?.propiedad?.vendida ? 'Vendida' : 'Disponible'}</span>
                <span>{selectedOffer?.esFavorito ? 'En favoritos' : 'Sin favorito'}</span>
              </div>

              <div className="property-sidebar-actions">
                <button
                  type="button"
                  className="properties-action-button primary full-width"
                  onClick={handleComprar}
                  disabled={selectedOffer?.propiedad?.vendida || pending.type === 'comprar'}
                >
                  {pending.type === 'comprar' ? 'Comprando...' : (selectedOffer?.propiedad?.vendida ? 'Vendida' : 'Comprar')}
                </button>

                <button
                  type="button"
                  className="properties-action-button secondary full-width"
                  onClick={handleToggleFavorito}
                  disabled={pending.type === 'favorito'}
                >
                  {pending.type === 'favorito' ? 'Actualizando...' : (selectedOffer?.esFavorito ? 'Quitar favorito' : 'Agregar favorito')}
                </button>
              </div>

              <div className="property-sidebar-note">
                La oferta activa determina las fotos, el precio, el contacto y la descripción que ves en pantalla.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}






