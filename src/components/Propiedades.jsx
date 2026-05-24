import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  agregarFavorito,
  eliminarFavorito,
  obtenerPublicaciones,
  obtenerPublicacionPorId,
  obtenerResenasPublicacion,
  agregarResena,
  eliminarResena,
  comprarPublicacion,
  getUserId,
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
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedPublicationId, setSelectedPublicationId] = useState(null);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [pendingAction, setPendingAction] = useState({ type: '', id: null });
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [successPropertyName, setSuccessPropertyName] = useState('');

  const userId = Number(getUserId() || 0);

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

  const activePublication = useMemo(() => {
    if (!selectedPublicationId) return null;
    return selectedPublication || publicaciones.find((pub) => pub.id === selectedPublicationId) || null;
  }, [publicaciones, selectedPublication, selectedPublicationId]);

  const patchPublication = (publicacionId, updater) => {
    setPublicaciones((prev) => prev.map((pub) => (pub.id === publicacionId ? updater(pub) : pub)));
    setSelectedPublication((prev) => (prev?.id === publicacionId ? updater(prev) : prev));
  };

  const loadPublicaciones = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await obtenerPublicaciones();
      setPublicaciones(Array.isArray(data) ? data : data?.content || []);

      if (!selectedPublicationId && Array.isArray(data) && data.length > 0) {
        setSelectedPublicationId(data[0].id);
      }
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadDetalle = async (publicacionId) => {
    if (!publicacionId) return;

    setDetailLoading(true);
    setError('');

    try {
      const [detalle, listaResenas] = await Promise.all([
        obtenerPublicacionPorId(publicacionId),
        obtenerResenasPublicacion(publicacionId),
      ]);

      setSelectedPublication(detalle);
      setResenas(Array.isArray(listaResenas) ? listaResenas : []);
      setReviewForm(initialReviewForm);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el detalle de la publicación');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadPublicaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPublicationId) {
      void loadDetalle(selectedPublicationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPublicationId]);

  const selectPublication = (publicacion) => {
    setSelectedPublicationId(publicacion.id);
    setSelectedPublication(publicacion);
  };

  const isPending = (type, id) => pendingAction.type === type && pendingAction.id === id;

  const toggleFavorito = async (publicacion) => {
    setPendingAction({ type: 'favorito', id: publicacion.id });
    setError('');
    setStatusMessage('');

    try {
      if (publicacion.esFavorito) {
        await eliminarFavorito(publicacion.id);
      } else {
        await agregarFavorito(publicacion.id);
      }

      patchPublication(publicacion.id, (current) => ({
        ...current,
        esFavorito: !current.esFavorito,
      }));

      setStatusMessage(
        publicacion.esFavorito ? 'Se eliminó de favoritos.' : 'Se agregó a favoritos.',
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
      if (selectedPublicationId === publicacion.id) {
        await loadDetalle(publicacion.id);
      }
    } catch (err) {
      setError(err.message || 'No se pudo completar la compra');
    } finally {
      setPendingAction({ type: '', id: null });
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!activePublication?.id) return;

    const puntaje = Number(reviewForm.puntaje);
    if (!Number.isFinite(puntaje) || puntaje < 0 || puntaje > 10) {
      setError('El puntaje debe estar entre 0 y 10.');
      return;
    }

    setPendingAction({ type: 'reseña', id: activePublication.id });
    setError('');
    setStatusMessage('');

    try {
      await agregarResena(activePublication.id, {
        puntaje,
        comentario: reviewForm.comentario.trim() || null,
      });

      setStatusMessage('Reseña agregada correctamente.');
      await loadDetalle(activePublication.id);
    } catch (err) {
      setError(err.message || 'No se pudo agregar la reseña');
    } finally {
      setPendingAction({ type: '', id: null });
    }
  };

  const handleDeleteResena = async (resena) => {
    const confirmed = window.confirm('¿Querés borrar esta reseña?');
    if (!confirmed) return;

    setPendingAction({ type: 'borrar-reseña', id: resena.id });
    setError('');
    setStatusMessage('');

    try {
      await eliminarResena(resena.publicacionId);
      setStatusMessage('Reseña eliminada correctamente.');
      if (activePublication?.id) {
        await loadDetalle(activePublication.id);
      }
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la reseña');
    } finally {
      setPendingAction({ type: '', id: null });
    }
  };

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
                  <span>{propiedad?.ambientes ?? '—'} ambientes</span>
                  <span>{propiedad?.sanitarios ?? '—'} baños</span>
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

                <div className="publication-grid">
                  {publicacionesDeLaPropiedad.map((publicacion) => {
                    const imagenPrincipal = Array.isArray(publicacion.imagenes) ? publicacion.imagenes[0] : '';
                    const isSelected = selectedPublicationId === publicacion.id;

                    return (
                      <article
                        key={publicacion.id}
                        className={`publication-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => selectPublication(publicacion)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            selectPublication(publicacion);
                          }
                        }}
                      >
                        <div className="publication-image-wrap">
                          {imagenPrincipal ? (
                            <img
                              src={imagenPrincipal}
                              alt={getPublicacionLabel(publicacion)}
                              className="publication-image"
                            />
                          ) : (
                            <div className="publication-image-placeholder">Sin imagen</div>
                          )}
                          <div className="publication-price">{formatCurrency(publicacion.precio)}</div>
                        </div>

                        <div className="publication-content">
                          <div className="publication-topline">
                            <span className="publication-inmobiliaria">
                              {publicacion.inmobiliaria?.nombre || 'Inmobiliaria'}
                            </span>
                            <span className={`publication-favorite ${publicacion.esFavorito ? 'active' : ''}`}>
                              {publicacion.esFavorito ? 'En favoritos' : 'No favorito'}
                            </span>
                          </div>

                          <h3 className="publication-title">{getPublicacionLabel(publicacion)}</h3>
                          <p className="publication-description">{publicacion.descripcion}</p>

                          <div className="publication-actions">
                            <button
                              type="button"
                              className="properties-action-button secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorito(publicacion);
                              }}
                              disabled={isPending('favorito', publicacion.id)}
                            >
                              {isPending('favorito', publicacion.id)
                                ? 'Actualizando...'
                                : publicacion.esFavorito
                                  ? 'Quitar favorito'
                                  : 'Agregar favorito'}
                            </button>


                            <button
                              type="button"
                              className="properties-action-button primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleComprar(publicacion);
                              }}
                              disabled={publicacion?.propiedad?.vendida || isPending('comprar', publicacion.id)}
                            >
                              {isPending('comprar', publicacion.id)
                                ? 'Comprando...'
                                : publicacion?.propiedad?.vendida
                                  ? 'Vendida'
                                  : 'Comprar'}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
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

          <aside className="properties-detail-panel">
            <div className="properties-detail-card">
              <div className="properties-detail-header">
                <div>
                  <p className="properties-eyebrow">Detalle de publicación</p>
                  <h2 className="properties-detail-title">
                    {activePublication ? `Publicación #${activePublication.id}` : 'Seleccioná una publicación'}
                  </h2>
                </div>
              </div>

              {detailLoading ? (
                <div className="properties-state-card compact">Cargando detalle...</div>
              ) : activePublication ? (
                <>
                  <div className="properties-detail-summary">
                    <p><strong>Inmobiliaria:</strong> {activePublication.inmobiliaria?.nombre || '—'}</p>
                    <p><strong>Precio:</strong> {formatCurrency(activePublication.precio)}</p>
                    <p><strong>Favorito:</strong> {activePublication.esFavorito ? 'Sí' : 'No'}</p>
                    <p><strong>Propiedad vendida:</strong> {activePublication?.propiedad?.vendida ? 'Sí' : 'No'}</p>
                  </div>

                  <div className="properties-detail-section">
                    <h3>Reseñar publicación</h3>
                    <form className="review-form" onSubmit={handleReviewSubmit}>
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
                          placeholder="Escribí tu opinión sobre la publicación"
                        />
                      </label>

                      <button
                        type="submit"
                        className="properties-action-button primary full-width"
                        disabled={isPending('reseña', activePublication.id)}
                      >
                        {isPending('reseña', activePublication.id) ? 'Guardando...' : 'Agregar reseña'}
                      </button>
                    </form>
                  </div>

                  <div className="properties-detail-section">
                    <h3>Reseñas de esta publicación</h3>
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
                                  disabled={isPending('borrar-reseña', resena.id)}
                                >
                                  {isPending('borrar-reseña', resena.id) ? 'Borrando...' : 'Borrar'}
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
                  </div>
                </>
              ) : (
                <p className="properties-empty-inline">
                  Elegí una publicación para ver su detalle, reseñas y acciones.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}





