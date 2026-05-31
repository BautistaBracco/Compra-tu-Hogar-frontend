import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  obtenerPublicacionPorId,
  obtenerResenasPublicacion,
  agregarResena,
  eliminarResena,
  comprarPublicacion,
  agregarFavorito,
  eliminarFavorito,
  getUserId,
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

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicacion, setPublicacion] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [pending, setPending] = useState({ type: '', id: null });
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const userId = Number(getUserId() || 0);

  const loadDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const [detalle, listaResenas] = await Promise.all([
        obtenerPublicacionPorId(Number(id)),
        obtenerResenasPublicacion(Number(id)),
      ]);

      setPublicacion(detalle);
      setResenas(Array.isArray(listaResenas) ? listaResenas : []);
      setReviewForm(initialReviewForm);
    } catch (err) {
      setError(err.message || 'No se pudo cargar la publicación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    void loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleComprar = async () => {
    if (!publicacion) return;
    if (publicacion.propiedad?.vendida) return;

    setPending({ type: 'comprar', id: publicacion.id });
    setError('');
    try {
      await comprarPublicacion(publicacion.id);
      setPurchaseSuccess(true);
      await loadDetail();
    } catch (err) {
      setError(err.message || 'No se pudo completar la compra');
    } finally {
      setPending({ type: '', id: null });
    }
  };

  const handleToggleFavorito = async () => {
    if (!publicacion) return;
    setPending({ type: 'favorito', id: publicacion.id });
    setError('');
    try {
      if (publicacion.esFavorito) await eliminarFavorito(publicacion.id);
      else await agregarFavorito(publicacion.id);
      await loadDetail();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar favorito');
    } finally {
      setPending({ type: '', id: null });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!publicacion) return;
    const puntaje = Number(reviewForm.puntaje);
    if (!Number.isFinite(puntaje) || puntaje < 0 || puntaje > 10) {
      setError('El puntaje debe estar entre 0 y 10.');
      return;
    }

    setPending({ type: 'reseña', id: publicacion.id });
    setError('');
    try {
      await agregarResena(publicacion.id, {
        puntaje,
        comentario: reviewForm.comentario.trim() || null,
      });
      await loadDetail();
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
      await loadDetail();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la reseña');
    } finally {
      setPending({ type: '', id: null });
    }
  };

  return (
    <div className="properties-page properties-page-detail properties-page-single-publication">
      <header className="properties-header">
        <div>
          <p className="properties-eyebrow">Publicación</p>
          <h1 className="properties-title">Detalle de la publicación</h1>
        </div>

        <div className="properties-header-actions">
          <button type="button" className="properties-back-link" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </header>

      {(error) && <section className="properties-messages"><div className="properties-error">{error}</div></section>}

      {loading ? (
        <div className="properties-state-card">Cargando publicación...</div>
      ) : !publicacion ? (
        <div className="properties-state-card">No se encontró la publicación.</div>
      ) : (
        <div className="properties-layout properties-layout--single">
          <div className="properties-list">
            <article className="properties-detail-card">
              <div className="properties-detail-header">
                <div>
                  <p className="properties-eyebrow">Inmobiliaria</p>
                  <h2 className="properties-detail-title">{publicacion.inmobiliaria?.nombre || '—'}</h2>
                </div>
                <div className={`property-status ${publicacion.propiedad?.vendida ? 'sold' : 'available'}`}>
                  {publicacion.propiedad?.vendida ? 'Vendida' : 'Disponible'}
                </div>
              </div>

              <div className="publication-image-wrap property-media property-media--detail">
                {Array.isArray(publicacion.imagenes) && publicacion.imagenes.length > 0 ? (
                  <img src={publicacion.imagenes[0]} alt={`Publicación ${publicacion.id}`} className="publication-image" />
                ) : (
                  <div className="publication-image-placeholder">Sin imagen</div>
                )}
                <div className="publication-price">{formatCurrency(publicacion.precio)}</div>
              </div>

              <div className="properties-detail-summary">
                <p><strong>Precio:</strong> {formatCurrency(publicacion.precio)}</p>
                <p><strong>Ubicación:</strong> {publicacion.propiedad?.ubicacion || '—'}</p>
                <p><strong>Piso:</strong> {publicacion.propiedad?.piso || '—'}</p>
                <p><strong>Depto:</strong> {publicacion.propiedad?.depto || '—'}</p>
                <p><strong>Superficie:</strong> {publicacion.propiedad?.superficie ?? '—'} m²</p>
                <p><strong>Ambientes:</strong> {publicacion.propiedad?.ambientes ?? '—'}</p>
                {publicacion.propiedad?.expensas && (
                  <p><strong>Expensas:</strong> {formatCurrency(publicacion.propiedad.expensas)}</p>
                )}
              </div>

              <div className="properties-detail-section">
                <h3>Descripción</h3>
                <p className="properties-empty-inline">{publicacion.descripcion || 'Sin descripción'}</p>
              </div>

              {Array.isArray(publicacion.propiedad?.caracteristicas) && publicacion.propiedad.caracteristicas.length > 0 && (
                <div className="properties-detail-section">
                  <h3>Características</h3>
                  <div className="characteristics-list">
                    {publicacion.propiedad.caracteristicas.map((caracteristica, index) => (
                      <span key={index} className="characteristic-chip">
                        {caracteristica}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="properties-detail-section">
                <h3>Acciones</h3>
                <div className="publication-actions">
                  <button
                    type="button"
                    className="properties-action-button secondary"
                    onClick={handleToggleFavorito}
                    disabled={pending.type === 'favorito'}
                  >
                    {pending.type === 'favorito' ? 'Actualizando...' : (publicacion.esFavorito ? 'Quitar favorito' : 'Agregar favorito')}
                  </button>
                  <button
                    type="button"
                    className="properties-action-button primary"
                    onClick={handleComprar}
                    disabled={publicacion.propiedad?.vendida || pending.type === 'comprar'}
                  >
                    {pending.type === 'comprar' ? 'Comprando...' : (publicacion.propiedad?.vendida ? 'Vendida' : 'Comprar')}
                  </button>
                </div>
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
                    disabled={pending.type === 'reseña'}
                  >
                    {pending.type === 'reseña' ? 'Guardando...' : 'Agregar reseña'}
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
              </div>
            </article>
          </div>
        </div>
      )}

      {purchaseSuccess && (
        <div className="properties-modal-overlay" onClick={() => setPurchaseSuccess(false)}>
          <div className="properties-modal" onClick={(e) => e.stopPropagation()}>
            <div className="properties-modal-header">
              <h2 className="properties-modal-title">¡Compra realizada con éxito! 🎉</h2>
            </div>
            <div className="properties-modal-content">
              <p>Has comprado exitosamente la publicación.</p>
            </div>
            <div className="properties-modal-footer">
              <button type="button" className="properties-action-button primary" onClick={() => setPurchaseSuccess(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


