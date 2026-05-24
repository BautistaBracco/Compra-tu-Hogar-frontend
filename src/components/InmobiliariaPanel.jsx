import { useEffect, useMemo, useState } from 'react';
import {
  logout,
  getUserId,
  crearPublicacion,
  eliminarPublicacion,
  modificarPublicacion,
  obtenerCaracteristicas,
  obtenerPropiedadPorUbicacion,
  obtenerPublicaciones,
} from '../auth';
import '../styles/components/inmobiliaria.css';

const TIPOS_PROPIEDAD = [
  { value: 'DEPTO', label: 'Depto' },
  { value: 'CASA', label: 'Casa' },
];

function buildInitialPropertyFormState() {
  return {
    tipo: 'DEPTO',
    ubicacion: '',
    piso: '',
    depto: '',
    superficie: '',
    ambientes: '',
    sanitarios: '',
    expensas: '',
    caracteristicaIds: [],
  };
}

function buildInitialPublicationFormState() {
  return {
    id: null,
    mode: 'create',
    descripcion: '',
    precio: '',
    imagenes: [],
    imagenUrlInput: '',
    propiedad: buildInitialPropertyFormState(),
    loading: false,
    error: '',
    success: '',
  };
}

function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value ?? '-';
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(number);
}

function parseImagesText(value) {
  return Array.from(
    new Set(
      String(value || '')
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeImageList(images = []) {
  if (!Array.isArray(images)) {
    return parseImagesText(images);
  }

  return Array.from(
    new Set(
      images
        .map((item) => String(item || '').trim())
        .filter(Boolean),
    ),
  );
}


function toNumberOrEmpty(value) {
  if (value === '' || value === null || value === undefined) return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : '';
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractCaracteristicaIds(caracteristicas = [], catalogo = []) {
  if (!Array.isArray(caracteristicas) || caracteristicas.length === 0) return [];

  const catalogoMap = new Map(
    catalogo.map((item) => [String(item.nombre || '').trim().toLowerCase(), item.id]),
  );

  return Array.from(
    new Set(
      caracteristicas
        .map((nombre) => catalogoMap.get(String(nombre || '').trim().toLowerCase()))
        .filter((id) => id !== undefined && id !== null),
    ),
  );
}

function mapPublicationToForm(publicacion) {
  const propiedad = publicacion?.propiedad || {};

  return {
    id: publicacion?.id ?? null,
    mode: 'edit',
    descripcion: publicacion?.descripcion || '',
    precio: publicacion?.precio ?? '',
    imagenes: normalizeImageList(publicacion?.imagenes),
    imagenUrlInput: '',
    propiedad: {
      tipo: propiedad.tipo || 'DEPTO',
      ubicacion: propiedad.ubicacion || '',
      piso: propiedad.piso || '',
      depto: propiedad.depto || '',
      superficie: propiedad.superficie ?? '',
      ambientes: propiedad.ambientes ?? '',
      sanitarios: propiedad.sanitarios ?? '',
      expensas: propiedad.expensas ?? '',
      caracteristicaIds: [],
    },
    loading: false,
    error: '',
    success: '',
  };
}

export function InmobiliariaPanel() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [publicaciones, setPublicaciones] = useState([]);
  const [publicacionesLoading, setPublicacionesLoading] = useState(false);
  const [publicacionesError, setPublicacionesError] = useState('');
  const [ubicacionFiltro, setUbicacionFiltro] = useState('');

  const [caracteristicas, setCaracteristicas] = useState([]);
  const [caracteristicasLoading, setCaracteristicasLoading] = useState(false);
  const [caracteristicasError, setCaracteristicasError] = useState('');

  const [publicationForm, setPublicationForm] = useState(buildInitialPublicationFormState());
  const [lookupState, setLookupState] = useState({
    loading: false,
    found: false,
    message: '',
  });

  const propiedadBloqueadaPorLookup = publicationForm.mode === 'create' && lookupState.found;
  const camposPropiedadDeshabilitados = publicationForm.mode === 'edit' || propiedadBloqueadaPorLookup;
  const imagenesSeleccionadas = normalizeImageList(publicationForm.imagenes);

  const inmobiliariaId = getUserId();

  const caracteristicasMap = useMemo(() => {
    return new Map(caracteristicas.map((item) => [String(item.nombre || '').trim().toLowerCase(), item.id]));
  }, [caracteristicas]);

  const cargarCaracteristicas = async () => {
    setCaracteristicasLoading(true);
    setCaracteristicasError('');

    try {
      const data = await obtenerCaracteristicas();
      setCaracteristicas(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      setCaracteristicasError(err.message || 'No se pudieron cargar las características');
    } finally {
      setCaracteristicasLoading(false);
    }
  };

  const cargarPublicaciones = async (ubicacion = ubicacionFiltro) => {
    setPublicacionesLoading(true);
    setPublicacionesError('');

    try {
      const data = await obtenerPublicaciones({
        inmobiliariaId: inmobiliariaId ? Number(inmobiliariaId) : undefined,
        ubicacion: ubicacion.trim() || undefined,
      });

      setPublicaciones(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      setPublicacionesError(err.message || 'No se pudieron cargar las publicaciones');
    } finally {
      setPublicacionesLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  useEffect(() => {
    document.body.classList.add('panel-inmobiliaria-no-scrollbar');

    return () => {
      document.body.classList.remove('panel-inmobiliaria-no-scrollbar');
    };
  }, []);

  useEffect(() => {
    cargarCaracteristicas();
  }, []);

  useEffect(() => {
    if (activeTab === 'publicaciones') {
      cargarPublicaciones();
    }
  }, [activeTab]);

  useEffect(() => {
    if (publicationForm.mode !== 'create') {
      setLookupState({ loading: false, found: false, message: '' });
      return undefined;
    }

    const ubicacion = String(publicationForm.propiedad.ubicacion || '').trim();
    const piso = String(publicationForm.propiedad.piso || '').trim();
    const depto = String(publicationForm.propiedad.depto || '').trim();

    if (!ubicacion) {
      setLookupState({ loading: false, found: false, message: '' });
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setLookupState({ loading: true, found: false, message: 'Buscando coincidencia...' });

      try {
        const propiedad = await obtenerPropiedadPorUbicacion(ubicacion, piso, depto);

        if (!propiedad) {
          setLookupState({
            loading: false,
            found: false,
            message: 'No se encontró una propiedad con esos datos.',
          });
          return;
        }

        setPublicationForm((prev) => ({
          ...prev,
          propiedad: {
            ...prev.propiedad,
            tipo: propiedad.tipo || prev.propiedad.tipo,
            ubicacion: propiedad.ubicacion || prev.propiedad.ubicacion,
            piso: propiedad.piso || prev.propiedad.piso,
            depto: propiedad.depto || prev.propiedad.depto,
            superficie: toNumberOrEmpty(propiedad.superficie),
            ambientes: toNumberOrEmpty(propiedad.ambientes),
            sanitarios: toNumberOrEmpty(propiedad.sanitarios),
            expensas: toNumberOrEmpty(propiedad.expensas),
            caracteristicaIds: extractCaracteristicaIds(propiedad.caracteristicas, caracteristicas),
          },
        }));

        setLookupState({
          loading: false,
          found: true,
          message: 'Propiedad encontrada y autocompletada.',
        });
      } catch (err) {
        setLookupState({
          loading: false,
          found: false,
          message: err.message || 'No se pudo autocompletar la propiedad.',
        });
      }
    }, 650);

    return () => window.clearTimeout(timeoutId);
  }, [
    publicationForm.mode,
    publicationForm.propiedad.ubicacion,
    publicationForm.propiedad.piso,
    publicationForm.propiedad.depto,
    caracteristicas,
    caracteristicasMap,
  ]);

  const actualizarCampoPublicacion = (campo, valor) => {
    setPublicationForm((prev) => ({
      ...prev,
      [campo]: valor,
      error: '',
      success: '',
    }));
  };

  const actualizarInputImagen = (valor) => {
    setPublicationForm((prev) => ({
      ...prev,
      imagenUrlInput: valor,
      error: '',
      success: '',
    }));
  };

  const agregarImagen = () => {
    const nuevasUrls = parseImagesText(publicationForm.imagenUrlInput);

    if (nuevasUrls.length === 0) {
      return;
    }

    setPublicationForm((prev) => ({
      ...prev,
      imagenes: normalizeImageList([...(prev.imagenes || []), ...nuevasUrls]),
      imagenUrlInput: '',
      error: '',
      success: '',
    }));
  };

  const eliminarImagen = (urlToRemove) => {
    setPublicationForm((prev) => ({
      ...prev,
      imagenes: (prev.imagenes || []).filter((url) => url !== urlToRemove),
      error: '',
      success: '',
    }));
  };

  // No file-upload handler: solo aceptamos URLs desde el input izquierdo.

  const actualizarCampoPropiedad = (campo, valor) => {
    setPublicationForm((prev) => ({
      ...prev,
      error: '',
      success: '',
      propiedad: {
        ...prev.propiedad,
        [campo]: valor,
      },
    }));
  };

  const toggleCaracteristica = (id, checked) => {
    setPublicationForm((prev) => {
      const currentIds = prev.propiedad.caracteristicaIds || [];
      const nextIds = checked
        ? Array.from(new Set([...currentIds, id]))
        : currentIds.filter((currentId) => currentId !== id);

      return {
        ...prev,
        error: '',
        success: '',
        propiedad: {
          ...prev.propiedad,
          caracteristicaIds: nextIds,
        },
      };
    });
  };

  const limpiarFormulario = () => {
    setPublicationForm(buildInitialPublicationFormState());
    setLookupState({ loading: false, found: false, message: '' });
  };

  const prepararEdicion = (publicacion) => {
    const form = mapPublicationToForm(publicacion);
    form.propiedad.caracteristicaIds = extractCaracteristicaIds(
      publicacion?.propiedad?.caracteristicas,
      caracteristicas,
    );

    setPublicationForm(form);
    setActiveTab('crear');
    setLookupState({ loading: false, found: true, message: 'Modo edición: la propiedad no se modifica desde este formulario.' });
  };

  const handleCrearOModificar = async (e) => {
    e.preventDefault();

    const descripcion = String(publicationForm.descripcion || '').trim();
    const precio = toNumberOrNull(publicationForm.precio);
    const imagenes = normalizeImageList(publicationForm.imagenes);
    const propiedad = publicationForm.propiedad || buildInitialPropertyFormState();

    if (!descripcion) {
      setPublicationForm((prev) => ({ ...prev, error: 'La descripción es requerida' }));
      return;
    }

    if (precio === null || precio <= 0) {
      setPublicationForm((prev) => ({ ...prev, error: 'El precio debe ser mayor a cero' }));
      return;
    }

    if (imagenes.length === 0) {
      setPublicationForm((prev) => ({ ...prev, error: 'Debes agregar al menos una imagen' }));
      return;
    }

    if (!propiedad.tipo) {
      setPublicationForm((prev) => ({ ...prev, error: 'El tipo de propiedad es requerido' }));
      return;
    }

    if (!String(propiedad.ubicacion || '').trim()) {
      setPublicationForm((prev) => ({ ...prev, error: 'La ubicación es requerida' }));
      return;
    }

    if (toNumberOrNull(propiedad.superficie) === null || toNumberOrNull(propiedad.superficie) <= 0) {
      setPublicationForm((prev) => ({ ...prev, error: 'La superficie debe ser mayor a cero' }));
      return;
    }

    if (toNumberOrNull(propiedad.ambientes) === null || toNumberOrNull(propiedad.ambientes) <= 0) {
      setPublicationForm((prev) => ({ ...prev, error: 'La cantidad de ambientes debe ser mayor a cero' }));
      return;
    }

    if (toNumberOrNull(propiedad.sanitarios) === null || toNumberOrNull(propiedad.sanitarios) < 0) {
      setPublicationForm((prev) => ({ ...prev, error: 'La cantidad de sanitarios no puede ser negativa' }));
      return;
    }

    if (toNumberOrNull(propiedad.expensas) === null || toNumberOrNull(propiedad.expensas) < 0) {
      setPublicationForm((prev) => ({ ...prev, error: 'Las expensas no pueden ser negativas' }));
      return;
    }

    setPublicationForm((prev) => ({ ...prev, loading: true, error: '', success: '' }));

    try {
      const payload = {
        descripcion,
        precio,
        imagenes,
        propiedad: {
          tipo: propiedad.tipo,
          ubicacion: String(propiedad.ubicacion || '').trim(),
          piso: String(propiedad.piso || '').trim(),
          depto: String(propiedad.depto || '').trim(),
          superficie: toNumberOrNull(propiedad.superficie),
          ambientes: toNumberOrNull(propiedad.ambientes),
          sanitarios: toNumberOrNull(propiedad.sanitarios),
          expensas: toNumberOrNull(propiedad.expensas),
          caracteristicaIds: Array.isArray(propiedad.caracteristicaIds)
            ? propiedad.caracteristicaIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
            : [],
        },
      };

      if (publicationForm.mode === 'edit' && publicationForm.id) {
        await modificarPublicacion(publicationForm.id, {
          descripcion: payload.descripcion,
          precio: payload.precio,
          imagenes: payload.imagenes,
        });

        setPublicationForm({
          ...buildInitialPublicationFormState(),
          success: '¡Publicación actualizada exitosamente!',
        });
      } else {
        await crearPublicacion(payload);

        setPublicationForm({
          ...buildInitialPublicationFormState(),
          success: '¡Publicación creada exitosamente!',
        });
      }

      await cargarPublicaciones();
    } catch (err) {
      setPublicationForm((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'No se pudo guardar la publicación',
      }));
    } finally {
      setPublicationForm((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleEliminar = async (publicacion) => {
    const confirmacion = window.confirm(`¿Eliminar la publicación #${publicacion.id}?`);

    if (!confirmacion) {
      return;
    }

    try {
      await eliminarPublicacion(publicacion.id);
      await cargarPublicaciones();
    } catch (err) {
      setPublicacionesError(err.message || 'No se pudo eliminar la publicación');
    }
  };

  const handleBuscarPublicaciones = async (e) => {
    e.preventDefault();
    await cargarPublicaciones(ubicacionFiltro);
  };

  const handleLimpiarFiltro = async () => {
    setUbicacionFiltro('');
    await cargarPublicaciones('');
  };

  return (
    <div className="inmobiliaria-container">
      <div className="inmobiliaria-header">
        <div className="inmobiliaria-title-section">
          <div className="inmobiliaria-badge">INMOBILIARIA</div>
          <h1 className="inmobiliaria-title">Panel de Inmobiliaria</h1>
        </div>
        <div className="inmobiliaria-header-buttons">
          <button
            type="button"
            className="inmobiliaria-home-button"
            onClick={() => window.location.href = '/home'}
          >
            Ir al Home
          </button>
          <button type="button" className="inmobiliaria-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="inmobiliaria-tabs">
        <button
          className={`inmobiliaria-tab ${activeTab === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveTab('inicio')}
        >
          Inicio
        </button>
        <button
          className={`inmobiliaria-tab ${activeTab === 'publicaciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('publicaciones')}
        >
          Publicaciones
        </button>
        <button
          className={`inmobiliaria-tab ${activeTab === 'crear' ? 'active' : ''}`}
          onClick={() => setActiveTab('crear')}
        >
          Crear / Editar
        </button>
      </div>

      <div className="inmobiliaria-content">
        {activeTab === 'inicio' && (
          <div className="inmobiliaria-card">
            <h2>Bienvenido al Panel de Inmobiliaria</h2>
            <p>
              Desde aquí puedes crear, editar y eliminar publicaciones, además de filtrar tus propiedades por ubicación.
            </p>
            <div className="inmobiliaria-info">
              <h3>Flujo de trabajo</h3>
              <ul>
                <li><strong>Crear publicación:</strong> completa los datos y, si existe una propiedad igual, se autocompleta sola.</li>
                <li><strong>Publicaciones:</strong> revisa tu catálogo vigente y filtra por ubicación.</li>
                <li><strong>Editar / eliminar:</strong> modifica descripción, precio e imágenes o elimina la publicación.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'publicaciones' && (
          <div className="inmobiliaria-section">
            <div className="inmobiliaria-card">
              <div className="section-toolbar">
                <div>
                  <h2>Mis publicaciones</h2>
                  <p>Se muestran las publicaciones vigentes de tu inmobiliaria.</p>
                </div>
                <button type="button" className="inmobiliaria-primary-button" onClick={() => setActiveTab('crear')}>
                  Nueva publicación
                </button>
              </div>

              <form className="filter-form" onSubmit={handleBuscarPublicaciones}>
                <div className="form-group">
                  <label htmlFor="filtro-ubicacion" className="form-label">
                    Buscar por ubicación
                  </label>
                  <input
                    id="filtro-ubicacion"
                    type="text"
                    value={ubicacionFiltro}
                    onChange={(e) => setUbicacionFiltro(e.target.value)}
                    placeholder="Palermo, CABA"
                    className="form-input"
                  />
                </div>

                <div className="filter-actions">
                  <button type="submit" className="inmobiliaria-primary-button" disabled={publicacionesLoading}>
                    {publicacionesLoading ? 'Buscando...' : 'Buscar'}
                  </button>
                  <button type="button" className="inmobiliaria-secondary-button" onClick={handleLimpiarFiltro}>
                    Limpiar
                  </button>
                </div>
              </form>

              {publicacionesError && <div className="form-error">{publicacionesError}</div>}

              <div className="panel-hint">
                <span>{publicaciones.length}</span>
                <p>publicaciones encontradas</p>
              </div>

              {publicacionesLoading ? (
                <p>Cargando publicaciones...</p>
              ) : publicaciones.length > 0 ? (
                <div className="publication-list">
                  {publicaciones.map((publicacion) => {
                    const propiedad = publicacion.propiedad || {};
                    const imagenPrincipal = Array.isArray(publicacion.imagenes) && publicacion.imagenes.length > 0
                      ? publicacion.imagenes[0]
                      : null;
                    const caracteristicasPublicacion = Array.isArray(propiedad.caracteristicas)
                      ? propiedad.caracteristicas
                      : Array.isArray(propiedad.caracteristicas?.content)
                        ? propiedad.caracteristicas.content
                        : Array.from(propiedad.caracteristicas || []);

                    return (
                      <article key={publicacion.id} className="publication-card">
                        <div className="publication-media">
                          {imagenPrincipal ? (
                            <img src={imagenPrincipal} alt={publicacion.descripcion || 'Publicación'} />
                          ) : (
                            <div className="publication-media-empty">Sin imagen</div>
                          )}
                        </div>

                        <div className="publication-body">
                          <div className="publication-head">
                            <div>
                              <span className="publication-id">#{publicacion.id}</span>
                              <h3>{publicacion.descripcion}</h3>
                            </div>
                            <strong className="publication-price">{formatCurrency(publicacion.precio)}</strong>
                          </div>

                          <div className="publication-meta">
                            <span>{propiedad.tipo || '-'}</span>
                            <span>{propiedad.ubicacion || '-'}</span>
                            <span>{propiedad.piso || 'PB'}</span>
                            <span>{propiedad.depto || '-'}</span>
                          </div>

                          <div className="publication-stats">
                            <span>{propiedad.superficie ?? '-'} m²</span>
                            <span>{propiedad.ambientes ?? '-'} ambientes</span>
                            <span>{propiedad.sanitarios ?? '-'} sanitarios</span>
                            <span>Expensas: {formatCurrency(propiedad.expensas ?? 0)}</span>
                          </div>

                          {Array.isArray(caracteristicasPublicacion) && caracteristicasPublicacion.length > 0 && (
                            <div className="characteristic-chips">
                              {caracteristicasPublicacion.map((caracteristica) => (
                                <span key={caracteristica} className="characteristic-chip">
                                  {caracteristica}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="publication-actions">
                            <button
                              type="button"
                              className="inmobiliaria-primary-button"
                              onClick={() => prepararEdicion(publicacion)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="inmobiliaria-danger-button"
                              onClick={() => handleEliminar(publicacion)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No hay publicaciones registradas aún.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'crear' && (
          <div className="inmobiliaria-section">
            <div className="inmobiliaria-card">
              <div className="section-toolbar">
                <div>
                  <h2>{publicationForm.mode === 'edit' ? 'Editar publicación' : 'Crear publicación'}</h2>
                  <p>
                    Completa los datos de la publicación. Si la propiedad ya existe, se autocompleta con el catálogo.
                  </p>
                </div>

                {publicationForm.mode === 'edit' && (
                  <button type="button" className="inmobiliaria-secondary-button" onClick={limpiarFormulario}>
                    Cancelar edición
                  </button>
                )}
              </div>

              <form onSubmit={handleCrearOModificar} className="inmobiliaria-form">
                <div className="form-group">
                  <label htmlFor="descripcion-publicacion" className="form-label">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion-publicacion"
                    value={publicationForm.descripcion}
                    onChange={(e) => actualizarCampoPublicacion('descripcion', e.target.value)}
                    placeholder="Departamento amplio y luminoso en excelente ubicación"
                    className="form-input"
                    rows="4"
                  />
                </div>

                <div className="form-grid two-columns">
                  <div className="form-group">
                    <label htmlFor="precio-publicacion" className="form-label">
                      Precio
                    </label>
                    <input
                      id="precio-publicacion"
                      type="number"
                      min="0"
                      step="0.01"
                      value={publicationForm.precio}
                      onChange={(e) => actualizarCampoPublicacion('precio', e.target.value)}
                      placeholder="120000.50"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="imagen-url-publicacion" className="form-label">
                      Imágenes
                    </label>
                    <div className="image-uploader">
                      <div className="image-uploader-controls">
                        <input
                          id="imagen-url-publicacion"
                          type="url"
                          value={publicationForm.imagenUrlInput}
                          onChange={(e) => actualizarInputImagen(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (String(publicationForm.imagenUrlInput || '').trim()) {
                                agregarImagen();
                              }
                            }
                          }}
                          placeholder="Pega una URL de imagen"
                          className="form-input"
                        />
                        <button
                          type="button"
                          className="inmobiliaria-primary-button image-add-button"
                          onClick={agregarImagen}
                          disabled={!String(publicationForm.imagenUrlInput || '').trim()}
                          aria-label="Agregar imagen"
                          title="Agregar imagen"
                        >
                          +
                        </button>
                      </div>

                      <p className="image-uploader-empty">
                        {imagenesSeleccionadas.length > 0
                          ? `${imagenesSeleccionadas.length} imagen(es) cargada(s). Se ven en la vista previa de la derecha.`
                          : 'Agrega una URL y presiona +. Las imágenes se muestran a la derecha.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-section-title">
                  <h3>Propiedad</h3>
                  <p>
                    {publicationForm.mode === 'edit'
                      ? 'Los datos de la propiedad no se editan desde esta pantalla.'
                      : 'Al escribir ubicación, piso y depto se intentará cargar automáticamente la propiedad.'}
                  </p>
                </div>

                <div className="form-grid three-columns">
                  <div className="form-group">
                    <label htmlFor="tipo-propiedad" className="form-label">
                      Tipo
                    </label>
                    <select
                      id="tipo-propiedad"
                      value={publicationForm.propiedad.tipo}
                      onChange={(e) => actualizarCampoPropiedad('tipo', e.target.value)}
                      className="form-input"
                      disabled={camposPropiedadDeshabilitados}
                    >
                      {TIPOS_PROPIEDAD.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="ubicacion-propiedad" className="form-label">
                      Ubicación
                    </label>
                    <input
                      id="ubicacion-propiedad"
                      type="text"
                      value={publicationForm.propiedad.ubicacion}
                      onChange={(e) => actualizarCampoPropiedad('ubicacion', e.target.value)}
                      placeholder="Palermo"
                      className="form-input"
                      disabled={camposPropiedadDeshabilitados}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="piso-propiedad" className="form-label">
                      Piso
                    </label>
                    <input
                      id="piso-propiedad"
                      type="text"
                      value={publicationForm.propiedad.piso}
                      onChange={(e) => actualizarCampoPropiedad('piso', e.target.value)}
                      placeholder="4 o PB"
                      className="form-input"
                      disabled={camposPropiedadDeshabilitados}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="depto-propiedad" className="form-label">
                      Depto
                    </label>
                    <input
                      id="depto-propiedad"
                      type="text"
                      value={publicationForm.propiedad.depto}
                      onChange={(e) => actualizarCampoPropiedad('depto', e.target.value)}
                      placeholder="A"
                      className="form-input"
                      disabled={camposPropiedadDeshabilitados}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="superficie-propiedad" className="form-label">
                      Superficie (m²)
                    </label>
                    <input
                      id="superficie-propiedad"
                      type="number"
                      min="1"
                      value={publicationForm.propiedad.superficie}
                      onChange={(e) => actualizarCampoPropiedad('superficie', e.target.value)}
                      className="form-input"
                      disabled={camposPropiedadDeshabilitados}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="ambientes-propiedad" className="form-label">
                      Ambientes
                    </label>
                    <input
                      id="ambientes-propiedad"
                      type="number"
                      min="1"
                      value={publicationForm.propiedad.ambientes}
                      onChange={(e) => actualizarCampoPropiedad('ambientes', e.target.value)}
                      className="form-input"
                      disabled={camposPropiedadDeshabilitados}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sanitarios-propiedad" className="form-label">
                      Sanitarios
                    </label>
                    <input
                      id="sanitarios-propiedad"
                      type="number"
                      min="0"
                      value={publicationForm.propiedad.sanitarios}
                      onChange={(e) => actualizarCampoPropiedad('sanitarios', e.target.value)}
                      className="form-input"
                      disabled={camposPropiedadDeshabilitados}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="expensas-propiedad" className="form-label">
                      Expensas
                    </label>
                    <input
                      id="expensas-propiedad"
                      type="number"
                      min="0"
                      value={publicationForm.propiedad.expensas}
                      onChange={(e) => actualizarCampoPropiedad('expensas', e.target.value)}
                      className="form-input"
                      disabled={camposPropiedadDeshabilitados}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Características</label>
                  {caracteristicasLoading ? (
                    <p>Cargando características...</p>
                  ) : caracteristicasError ? (
                    <div className="form-error">{caracteristicasError}</div>
                  ) : caracteristicas.length > 0 ? (
                    <div className="characteristic-selector">
                      {caracteristicas.map((caracteristica) => {
                        const checked = publicationForm.propiedad.caracteristicaIds.includes(caracteristica.id);

                        return (
                          <label
                            key={caracteristica.id}
                            className={`characteristic-option ${camposPropiedadDeshabilitados ? 'locked' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => toggleCaracteristica(caracteristica.id, e.target.checked)}
                              disabled={camposPropiedadDeshabilitados}
                            />
                            <span>
                              <strong>{caracteristica.nombre}</strong>
                              {caracteristica.descripcion && <small>{caracteristica.descripcion}</small>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p>No hay características disponibles.</p>
                  )}
                </div>

                {lookupState.message && (
                  <div className={`lookup-state ${lookupState.found ? 'success' : ''}`}>
                    {lookupState.loading ? '⏳ ' : lookupState.found ? '✅ ' : 'ℹ️ '}
                    {lookupState.message}
                  </div>
                )}

                {publicationForm.error && <div className="form-error">{publicationForm.error}</div>}
                {publicationForm.success && <div className="form-success">{publicationForm.success}</div>}

                <div className="form-actions">
                  <button type="submit" disabled={publicationForm.loading} className="inmobiliaria-primary-button">
                    {publicationForm.loading
                      ? 'Guardando...'
                      : publicationForm.mode === 'edit'
                        ? 'Guardar cambios'
                        : 'Crear publicación'}
                  </button>

                  {publicationForm.mode === 'create' && (
                    <button type="button" className="inmobiliaria-secondary-button" onClick={limpiarFormulario}>
                      Limpiar formulario
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="inmobiliaria-card">
              <h2>Vista previa</h2>
              <p>Resumen rápido de lo que estás cargando.</p>

              <div className="preview-box">
                <strong>{publicationForm.descripcion || 'Sin descripción todavía'}</strong>
                <span>{formatCurrency(publicationForm.precio || 0)}</span>
                <small>
                  {publicationForm.propiedad.tipo} · {publicationForm.propiedad.ubicacion || 'Ubicación pendiente'}
                </small>
              </div>

              <div className="preview-details">
                <span>Superficie: {publicationForm.propiedad.superficie || '-'}</span>
                <span>Ambientes: {publicationForm.propiedad.ambientes || '-'}</span>
                <span>Sanitarios: {publicationForm.propiedad.sanitarios || '-'}</span>
                <span>Expensas: {publicationForm.propiedad.expensas || '-'}</span>
              </div>

              <div className="preview-images">
                {imagenesSeleccionadas.slice(0, 3).map((url) => (
                  <span key={url} className="preview-image-item preview-image-thumb">
                    <img src={url} alt="Vista previa" />
                    <button
                      type="button"
                      className="preview-image-remove"
                      onClick={() => eliminarImagen(url)}
                      aria-label="Eliminar imagen"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {imagenesSeleccionadas.length === 0 && (
                  <p className="preview-empty">Agrega una URL y presiona + para ver las imágenes aquí.</p>
                )}
              </div>

              <div className="preview-note">
                <h3>Autocompletado</h3>
                <p>
                  Si coinciden ubicación, piso y depto con una propiedad existente, el formulario completa automáticamente
                  superficie, ambientes, sanitarios, expensas y características.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

