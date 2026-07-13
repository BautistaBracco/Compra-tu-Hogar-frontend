import { useState, useEffect } from 'react';
import {
  logout,
  crearInmobiliaria,
  obtenerInmobiliarias,
  crearCaracteristica,
  obtenerCaracteristicas,
  obtenerResenasDeUsuario,
  obtenerFavoritosAdmin,
  obtenerFavoritosPublicacion,
  obtenerTodasLasResenias,
  obtenerUsuarioPorId,
  obtenerComprasAdmin,
  obtenerUsuarios,
  obtenerTopUsuarios,
  obtenerTopPublicaciones,
  obtenerTopInmobiliarias,
} from '../auth';
import '../styles/components/admin.css';

const initialInmobiliariaFormState = {
  nombre: '',
  email: '',
  password: '',
  loading: false,
  error: '',
  success: '',
};

const initialCaracteristicaFormState = {
  nombre: '',
  loading: false,
  error: '',
  success: '',
};

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('inicio');

  // Inmobiliarias
  const [inmobiliarias, setInmobiliarias] = useState([]);
  const [inmobiliariaForm, setInmobiliariaForm] = useState(initialInmobiliariaFormState);

  // Características
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [caracteristicaForm, setCaracteristicaForm] = useState(initialCaracteristicaFormState);

  // Usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuariosError, setUsuariosError] = useState('');
  const [usuarioRolFilter, setUsuarioRolFilter] = useState('COMPRADOR');

  // Compras
  const [compras, setCompras] = useState([]);
  const [comprasLoading, setComprasLoading] = useState(false);
  const [comprasError, setComprasError] = useState('');

  // Favoritos por usuario
  const [usuarioIdFavorito, setUsuarioIdFavorito] = useState('');
  const [favoritosUsuario, setFavoritosUsuario] = useState([]);
  const [favoritosUsuarioLoading, setFavoritosUsuarioLoading] = useState(false);
  const [favoritosUsuarioError, setFavoritosUsuarioError] = useState('');
  const [usuarioNombreFavorito, setUsuarioNombreFavorito] = useState('');

  // Reseñas por usuario
  const [usuarioIdResena, setUsuarioIdResena] = useState('');
  const [resenasUsuario, setResenasUsuario] = useState([]);
  const [resenasLoading, setResenasLoading] = useState(false);
  const [resenasError, setResenasError] = useState('');
  const [usuarioNombreResena, setUsuarioNombreResena] = useState('');

  // Rankings
  const [topUsuarios, setTopUsuarios] = useState([]);
  const [topPublicaciones, setTopPublicaciones] = useState([]);
  const [topInmobiliarias, setTopInmobiliarias] = useState([]);
  const [rankingsLoading, setRankingsLoading] = useState(false);
  const [rankingsError, setRankingsError] = useState('');

  // Cargar inmobiliarias al montar
  useEffect(() => {
    if (activeTab === 'inmobiliarias') {
      cargarInmobiliarias();
    }
  }, [activeTab]);

  // Cargar características al montar
  useEffect(() => {
    if (activeTab === 'caracteristicas') {
      cargarCaracteristicas();
    }
  }, [activeTab]);

  // Cargar usuarios cuando cambia la pestaña o el filtro
  useEffect(() => {
    if (activeTab === 'usuarios') {
      cargarUsuarios();
    }
  }, [activeTab, usuarioRolFilter]);

  // Cargar compras
  useEffect(() => {
    if (activeTab === 'compras') {
      cargarCompras();
    }
  }, [activeTab]);

  // Cargar favoritos
  useEffect(() => {
    if (activeTab === 'favoritos') {
      cargarFavoritosUsuario();
    }
  }, [activeTab]);

  // Cargar reseñas
  useEffect(() => {
    if (activeTab === 'resenias') {
      cargarResenasUsuario();
    }
  }, [activeTab]);

  // Cargar rankings
  useEffect(() => {
    if (activeTab === 'rankings') {
      cargarRankings();
    }
  }, [activeTab]);

  useEffect(() => {
    document.body.classList.add('panel-admin-no-scrollbar');

    return () => {
      document.body.classList.remove('panel-admin-no-scrollbar');
    };
  }, []);

  const cargarInmobiliarias = async () => {
    try {
      const data = await obtenerInmobiliarias();
      setInmobiliarias(data.content || data || []);
      setInmobiliariaForm((prev) => ({ ...prev, error: '' }));
    } catch (err) {
      console.error('Error completo:', err);
      setInmobiliariaForm((prev) => ({ ...prev, error: `Error: ${err.message}` }));
    }
  };

  const cargarCaracteristicas = async () => {
    try {
      const data = await obtenerCaracteristicas();
      setCaracteristicas(Array.isArray(data) ? data : data.content || []);
      setCaracteristicaForm((prev) => ({ ...prev, error: '' }));
    } catch (err) {
      console.error('Error completo:', err);
      setCaracteristicaForm((prev) => ({ ...prev, error: `Error: ${err.message}` }));
    }
  };

  const handleCrearInmobiliaria = async (e) => {
    e.preventDefault();
    setInmobiliariaForm((prev) => ({ ...prev, error: '', success: '' }));

    if (!inmobiliariaForm.nombre.trim()) {
      setInmobiliariaForm((prev) => ({ ...prev, error: 'El nombre es requerido' }));
      return;
    }

    if (!inmobiliariaForm.email.trim()) {
      setInmobiliariaForm((prev) => ({ ...prev, error: 'El email es requerido' }));
      return;
    }

    if (inmobiliariaForm.password.length < 8) {
      setInmobiliariaForm((prev) => ({ ...prev, error: 'La contraseña debe tener mínimo 8 caracteres' }));
      return;
    }

    setInmobiliariaForm((prev) => ({ ...prev, loading: true, error: '', success: '' }));

    try {
      await crearInmobiliaria(inmobiliariaForm.nombre, inmobiliariaForm.email, inmobiliariaForm.password);
      setInmobiliariaForm({ ...initialInmobiliariaFormState, success: '¡Inmobiliaria creada exitosamente!' });
      await cargarInmobiliarias();
    } catch (err) {
      setInmobiliariaForm((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Error al crear la inmobiliaria',
      }));
    } finally {
      setInmobiliariaForm((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCrearCaracteristica = async (e) => {
    e.preventDefault();
    setCaracteristicaForm((prev) => ({ ...prev, error: '', success: '' }));

    if (!caracteristicaForm.nombre.trim()) {
      setCaracteristicaForm((prev) => ({ ...prev, error: 'El nombre es requerido' }));
      return;
    }

    setCaracteristicaForm((prev) => ({ ...prev, loading: true, error: '', success: '' }));

    try {
      await crearCaracteristica(caracteristicaForm.nombre);
      setCaracteristicaForm({ ...initialCaracteristicaFormState, success: '¡Característica creada exitosamente!' });
      await cargarCaracteristicas();
    } catch (err) {
      setCaracteristicaForm((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Error al crear la característica',
      }));
    } finally {
      setCaracteristicaForm((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Handlers para Usuarios
  const cargarUsuarios = async () => {
    setUsuariosLoading(true);
    setUsuariosError('');
    try {
      const data = await obtenerUsuarios(usuarioRolFilter);
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error:', err);
      setUsuariosError(err.message);
    } finally {
      setUsuariosLoading(false);
    }
  };

  // Handlers para Compras
  const cargarCompras = async () => {
    setComprasLoading(true);
    setComprasError('');
    try {
      const data = await obtenerComprasAdmin();
      setCompras(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error:', err);
      setComprasError(err.message);
    } finally {
      setComprasLoading(false);
    }
  };

  // Cargar favoritos del usuario especificado, o todos si no hay ID
  const cargarFavoritosUsuario = async () => {
    setFavoritosUsuarioLoading(true);
    setFavoritosUsuarioError('');
    setFavoritosUsuario([]);
    setUsuarioNombreFavorito('');
    try {
      const esIdVacio = !String(usuarioIdFavorito || '').trim();

      if (esIdVacio) {
        // Sin filtro: cargar TODOS los favoritos del sistema
        setUsuarioNombreFavorito('Todos los favoritos del sistema');
        const publicaciones = await obtenerFavoritosAdmin();
        setFavoritosUsuario(Array.isArray(publicaciones) ? publicaciones : []);
      } else {
        // Con filtro: cargar favoritos del usuario específico
        try {
          const usuario = await obtenerUsuarioPorId(usuarioIdFavorito);
          setUsuarioNombreFavorito(usuario?.nombre || `Usuario #${usuarioIdFavorito}`);
        } catch (e) {
          setUsuarioNombreFavorito(`Usuario #${usuarioIdFavorito}`);
        }
        const publicaciones = await obtenerFavoritosAdmin();
        const pubs = Array.isArray(publicaciones) ? publicaciones : [];

        // Para cada publicación consultamos los usuarios que la marcaron
        const checks = await Promise.all(pubs.map(async (pub) => {
          try {
            const usuariosQueFav = await obtenerFavoritosPublicacion(pub.id);
            const found = Array.isArray(usuariosQueFav) && usuariosQueFav.some((u) => String(u.id) === String(usuarioIdFavorito));
            return found ? pub : null;
          } catch (e) {
            return null;
          }
        }));

        const favoritosDelUsuario = checks.filter(Boolean);
        setFavoritosUsuario(favoritosDelUsuario);
      }
    } catch (err) {
      console.error('Error al obtener favoritos por usuario:', err);
      setFavoritosUsuarioError(err.message || 'Error al obtener favoritos');
    } finally {
      setFavoritosUsuarioLoading(false);
    }
  };

  // Cargar reseñas del usuario especificado, o todas si no hay ID
  const cargarResenasUsuario = async () => {
    setResenasLoading(true);
    setResenasError('');
    setUsuarioNombreResena('');
    try {
      const esIdVacio = !String(usuarioIdResena || '').trim();

      if (esIdVacio) {
        // Sin filtro: cargar TODAS las reseñas del sistema
        setUsuarioNombreResena('Todas las reseñas del sistema');
        const data = await obtenerTodasLasResenias();
        setResenasUsuario(Array.isArray(data) ? data : []);
      } else {
        // Con filtro: cargar reseñas del usuario específico
        try {
          const usuario = await obtenerUsuarioPorId(usuarioIdResena);
          setUsuarioNombreResena(usuario?.nombre || `Usuario #${usuarioIdResena}`);
        } catch (e) {
          setUsuarioNombreResena(`Usuario #${usuarioIdResena}`);
        }
        const data = await obtenerResenasDeUsuario(usuarioIdResena);
        setResenasUsuario(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error:', err);
      setResenasError(err.message);
    } finally {
      setResenasLoading(false);
    }
  };

  // Handlers para Rankings
  const cargarRankings = async () => {
    setRankingsLoading(true);
    setRankingsError('');
    try {
      const [usuariosData, publicacionesData] = await Promise.all([
        obtenerTopUsuarios(),
        obtenerTopPublicaciones(),
      ]);
      setTopUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setTopPublicaciones(Array.isArray(publicacionesData) ? publicacionesData : []);

      try {
        const comprasData = await obtenerComprasAdmin();
        const ventasMap = new Map();
        (Array.isArray(comprasData) ? comprasData : []).forEach((compra) => {
          const inm = compra?.publicacion?.inmobiliaria;
          if (!inm || !inm.id) return;
          const id = inm.id;
          if (!ventasMap.has(id)) ventasMap.set(id, { inmobiliaria: inm, ventasCount: 0 });
          ventasMap.get(id).ventasCount += 1;
        });

        const inmobiliariasComputed = Array.from(ventasMap.values()).sort((a, b) => b.ventasCount - a.ventasCount);
        setTopInmobiliarias(inmobiliariasComputed);
      } catch (e) {
        const inmobiliariasData = await obtenerTopInmobiliarias();
        setTopInmobiliarias(Array.isArray(inmobiliariasData) ? inmobiliariasData : []);
      }
    } catch (err) {
      console.error('Error:', err);
      setRankingsError(err.message);
    } finally {
      setRankingsLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-title-section">
          <div className="admin-badge">ADMIN</div>
          <h1 className="admin-title">Panel de Administrador</h1>
        </div>
        <div className="admin-header-buttons">
          <button
            type="button"
            className="admin-home-button"
            onClick={() => window.location.href = '/home'}
          >
            Ir al Home
          </button>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveTab('inicio')}
        >
          Inicio
        </button>
        <button
          className={`admin-tab ${activeTab === 'inmobiliarias' ? 'active' : ''}`}
          onClick={() => setActiveTab('inmobiliarias')}
        >
          Inmobiliarias
        </button>
        <button
          className={`admin-tab ${activeTab === 'caracteristicas' ? 'active' : ''}`}
          onClick={() => setActiveTab('caracteristicas')}
        >
          Características
        </button>
        <button
          className={`admin-tab ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          Usuarios
        </button>
        <button
          className={`admin-tab ${activeTab === 'compras' ? 'active' : ''}`}
          onClick={() => setActiveTab('compras')}
        >
          Compras
        </button>
        <button
          className={`admin-tab ${activeTab === 'favoritos' ? 'active' : ''}`}
          onClick={() => setActiveTab('favoritos')}
        >
          Favoritos
        </button>
        <button
          className={`admin-tab ${activeTab === 'resenias' ? 'active' : ''}`}
          onClick={() => setActiveTab('resenias')}
        >
          Reseñas
        </button>
        <button
          className={`admin-tab ${activeTab === 'rankings' ? 'active' : ''}`}
          onClick={() => setActiveTab('rankings')}
        >
          Rankings
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'inicio' && (
          <div className="admin-card">
            <h2>Bienvenido al Panel de Administrador</h2>
            <p>
              Desde aquí podrás administrar inmobiliarias, crear características para las propiedades y gestionar el sistema.
            </p>
            <div className="admin-info">
              <h3>Funcionalidades disponibles:</h3>
              <ul>
                <li><strong>Inmobiliarias:</strong> Crear nuevas inmobiliarias en el sistema</li>
                <li><strong>Características:</strong> Crear características (ej: parrilla, piscina) que se usarán en las publicaciones</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'inmobiliarias' && (
          <div className="admin-section">
            <div className="admin-card">
              <h2>Crear Inmobiliaria</h2>
              <form onSubmit={handleCrearInmobiliaria} className="admin-form">
                <div className="form-group">
                  <label htmlFor="nombre-inmob" className="form-label">
                    Nombre
                  </label>
                  <input
                    id="nombre-inmob"
                    type="text"
                    value={inmobiliariaForm.nombre}
                    onChange={(e) => setInmobiliariaForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="RE/MAX Norte"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email-inmob" className="form-label">
                    Email
                  </label>
                  <input
                    id="email-inmob"
                    type="email"
                    value={inmobiliariaForm.email}
                    onChange={(e) => setInmobiliariaForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="inmobiliaria@email.com"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password-inmob" className="form-label">
                    Contraseña
                  </label>
                  <input
                    id="password-inmob"
                    type="password"
                    value={inmobiliariaForm.password}
                    onChange={(e) => setInmobiliariaForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength="8"
                    className="form-input"
                  />
                </div>

                {inmobiliariaForm.error && <div className="form-error">{inmobiliariaForm.error}</div>}
                {inmobiliariaForm.success && <div className="form-success">{inmobiliariaForm.success}</div>}

                <button
                  type="submit"
                  disabled={inmobiliariaForm.loading}
                  className="admin-button"
                >
                  {inmobiliariaForm.loading ? 'Creando...' : 'Crear Inmobiliaria'}
                </button>
              </form>
            </div>

            <div className="admin-card">
              <h2>Inmobiliarias Registradas</h2>
              {inmobiliarias.length > 0 ? (
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inmobiliarias.map((inmob) => (
                        <tr key={inmob.id}>
                          <td>{inmob.id}</td>
                          <td>{inmob.nombre}</td>
                          <td>{inmob.mail || inmob.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No hay inmobiliarias registradas aún.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'caracteristicas' && (
          <div className="admin-section">
            <div className="admin-card">
              <h2>Crear Característica</h2>
              <form onSubmit={handleCrearCaracteristica} className="admin-form">
                <div className="form-group">
                  <label htmlFor="nombre-carac" className="form-label">
                    Nombre
                  </label>
                  <input
                    id="nombre-carac"
                    type="text"
                    value={caracteristicaForm.nombre}
                    onChange={(e) => setCaracteristicaForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="ej: Parrilla, Piscina, Garaje"
                    required
                    className="form-input"
                  />
                </div>

                {caracteristicaForm.error && <div className="form-error">{caracteristicaForm.error}</div>}
                {caracteristicaForm.success && <div className="form-success">{caracteristicaForm.success}</div>}

                <button
                  type="submit"
                  disabled={caracteristicaForm.loading}
                  className="admin-button"
                >
                  {caracteristicaForm.loading ? 'Creando...' : 'Crear Característica'}
                </button>
              </form>
            </div>

            <div className="admin-card">
              <h2>Características Disponibles</h2>
              {caracteristicas.length > 0 ? (
                <div className="admin-characteristics">
                  {caracteristicas.map((carac) => (
                    <div key={carac.id} className="characteristic-item">
                      <h4>{carac.nombre}</h4>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No hay características creadas aún.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="admin-section">
            <div className="admin-card">
              <h2>Gestión de Usuarios</h2>
              <div className="form-group">
                <label className="form-label">Filtrar por Rol</label>
                <select
                  value={usuarioRolFilter}
                  onChange={(e) => setUsuarioRolFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="COMPRADOR">Compradores</option>
                  <option value="INMOBILIARIA">Inmobiliarias</option>
                  <option value="ADMIN">Administradores</option>
                </select>
              </div>
              {usuariosError && <div className="form-error">{usuariosError}</div>}
              {usuariosLoading ? (
                <p>Cargando usuarios...</p>
              ) : usuarios.length > 0 ? (
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                          <td>{usuario.id}</td>
                          <td>{usuario.nombre}</td>
                          <td>{usuario.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No hay usuarios para mostrar.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'compras' && (
          <div className="admin-section">
            <div className="admin-card">
              <h2>Historial de Compras</h2>
              {comprasError && <div className="form-error">{comprasError}</div>}
              {comprasLoading ? (
                <p>Cargando compras...</p>
              ) : compras.length > 0 ? (
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID Compra</th>
                        <th>Comprador</th>
                        <th>Propiedad (Ubicación)</th>
                        <th>Precio Final</th>
                        <th>Fecha Compra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compras.map((compra) => (
                        <tr key={compra.id}>
                          <td>{compra.id}</td>
                          <td>{compra.comprador?.nombre || 'N/A'}</td>
                          <td>{compra.publicacion?.propiedad?.ubicacion || 'N/A'}</td>
                          <td>${compra.precioFinal?.toLocaleString() || 'N/A'}</td>
                          <td>{new Date(compra.fechaCompra).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No hay compras registradas.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'favoritos' && (
          <div className="admin-section">
            <div className="admin-card">
              <h2>Favoritos por Usuario</h2>
              <form onSubmit={(e) => { e.preventDefault(); cargarFavoritosUsuario(); }} className="admin-form">
                <div className="form-group">
                  <label htmlFor="usuario-id-fav" className="form-label">
                    ID del Usuario
                  </label>
                  <input
                    id="usuario-id-fav"
                    type="number"
                    value={usuarioIdFavorito}
                    onChange={(e) => setUsuarioIdFavorito(e.target.value)}
                    placeholder="Ingresa el ID del usuario o deja vacío para ver todos"
                    className="form-input"
                  />
                </div>
                <button type="submit" className="admin-button" disabled={favoritosUsuarioLoading}>
                  {favoritosUsuarioLoading ? 'Cargando...' : usuarioIdFavorito ? 'Filtrar Favoritos' : 'Ver Todos'}
                </button>
              </form>

              {favoritosUsuarioError && <div className="form-error">{favoritosUsuarioError}</div>}
              {usuarioNombreFavorito && <div style={{ margin: '8px 0' }}><strong>Usuario:</strong> {usuarioNombreFavorito}</div>}

              {favoritosUsuarioLoading ? (
                <p>Cargando publicaciones favoritas...</p>
              ) : favoritosUsuario.length > 0 ? (
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID Publicación</th>
                        <th>Ubicación</th>
                        <th>Tipo</th>
                        <th>Precio</th>
                        <th>Inmobiliaria</th>
                      </tr>
                    </thead>
                    <tbody>
                      {favoritosUsuario.map((publicacion) => (
                        <tr key={publicacion.id}>
                          <td>{publicacion.id}</td>
                          <td>{publicacion.propiedad?.ubicacion || 'N/A'}</td>
                          <td>{publicacion.propiedad?.tipo || 'N/A'}</td>
                          <td>${publicacion.precio?.toLocaleString() || 'N/A'}</td>
                          <td>{publicacion.inmobiliaria?.nombre || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : usuarioNombreFavorito && !favoritosUsuarioLoading ? (
                <p>No hay publicaciones favoritas.</p>
              ) : null}
            </div>
          </div>
        )}

        {activeTab === 'resenias' && (
          <div className="admin-section">
            <div className="admin-card">
              <h2>Reseñas por Usuario</h2>
              <form onSubmit={(e) => { e.preventDefault(); cargarResenasUsuario(); }} className="admin-form">
                <div className="form-group">
                  <label htmlFor="usuario-id-resena" className="form-label">
                    ID del Usuario
                  </label>
                  <input
                    id="usuario-id-resena"
                    type="number"
                    value={usuarioIdResena}
                    onChange={(e) => setUsuarioIdResena(e.target.value)}
                    placeholder="Ingresa el ID del usuario o deja vacío para ver todos"
                    className="form-input"
                  />
                </div>
                <button type="submit" className="admin-button" disabled={resenasLoading}>
                  {resenasLoading ? 'Cargando...' : usuarioIdResena ? 'Filtrar Reseñas' : 'Ver Todos'}
                </button>
              </form>
              {resenasError && <div className="form-error">{resenasError}</div>}
              {usuarioNombreResena && <div style={{ margin: '8px 0' }}><strong>Usuario:</strong> {usuarioNombreResena}</div>}
              {resenasUsuario.length > 0 ? (
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID Reseña</th>
                        <th>Publicación</th>
                        <th>Autor</th>
                        <th>Puntaje</th>
                        <th>Comentario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resenasUsuario.map((resena) => (
                        <tr key={resena.id}>
                          <td>{resena.id}</td>
                          <td>{resena.publicacionId}</td>
                          <td>{resena.autorNombre || 'N/A'}</td>
                          <td>{resena.puntaje} ⭐</td>
                          <td>{resena.comentario || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : usuarioNombreResena && !resenasLoading ? (
                <p>No hay reseñas.</p>
              ) : null}
            </div>
          </div>
        )}

        {activeTab === 'rankings' && (
            <div className="rankings-full-width-container">
              {rankingsError && <div className="form-error">{rankingsError}</div>}
              {rankingsLoading ? (
                  <p>Cargando rankings...</p>
              ) : (
                  <div className="rankings-grid">
                    {/* Top Usuarios */}
                    <div className="admin-card">
                      <h2>🏆 Top 5 Usuarios (Mayor Cantidad de Compras)</h2>
                      {topUsuarios.length > 0 ? (
                          <div className="admin-table">
                            <table>
                              <thead>
                              <tr>
                                <th>Posición</th>
                                <th>Usuario</th>
                                <th>Compras</th>
                              </tr>
                              </thead>
                              <tbody>
                              {topUsuarios.map((item, index) => (
                                  <tr key={item.usuario?.id || index}>
                                    <td>#{index + 1}</td>
                                    <td>{item.usuario?.nombre || 'N/A'}</td>
                                    <td>{item.comprasCount}</td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                      ) : <p>No hay datos.</p>}
                    </div>

                    {/* Top Propiedades */}
                    <div className="admin-card">
                      <h2>🏆 Top 5 Propiedades (Mejor Rankeadas)</h2>
                      {topPublicaciones.length > 0 ? (
                          <div className="admin-table">
                            <table>
                              <thead>
                              <tr>
                                <th>Posición</th>
                                <th>Ubicación</th>
                                <th>Rating</th>
                              </tr>
                              </thead>
                              <tbody>
                              {topPublicaciones.map((item, index) => (
                                  <tr key={item.propiedad?.id || index}>
                                    <td>#{index + 1}</td>
                                    <td>{item.propiedad?.ubicacion || 'N/A'}</td>
                                    <td>{item.averageRating?.toFixed(2) || 'N/A'} ⭐</td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                      ) : <p>No hay datos.</p>}
                    </div>

                    {/* Top Inmobiliarias */}
                    <div className="admin-card">
                      <h2>🏆 Top 5 Inmobiliarias (Mayor Volumen de Ventas)</h2>
                      {topInmobiliarias.length > 0 ? (
                          <div className="admin-table">
                            <table>
                              <thead>
                              <tr>
                                <th>Posición</th>
                                <th>Inmobiliaria</th>
                                <th>Ventas</th>
                              </tr>
                              </thead>
                              <tbody>
                              {topInmobiliarias.slice(0, 5).map((item, index) => (
                                  <tr key={item.inmobiliaria?.id || index}>
                                    <td>#{index + 1}</td>
                                    <td>{item.inmobiliaria?.nombre || 'N/A'}</td>
                                    <td>{item.ventasCount}</td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                      ) : <p>No hay datos.</p>}
                    </div>
                  </div>
              )}
            </div>
        )}

      </div>
    </div>
  );
}
