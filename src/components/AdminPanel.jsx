import { useState, useEffect } from 'react';
import { logout, crearInmobiliaria, obtenerInmobiliarias, crearCaracteristica, obtenerCaracteristicas } from '../auth';
import '../styles/components/admin.css';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('inicio');

  // Inmobiliarias
  const [inmobiliarias, setInmobiliarias] = useState([]);
  const [nombreInmob, setNombreInmob] = useState('');
  const [emailInmob, setEmailInmob] = useState('');
  const [passwordInmob, setPasswordInmob] = useState('');
  const [loadingInmob, setLoadingInmob] = useState(false);
  const [errorInmob, setErrorInmob] = useState('');
  const [successInmob, setSuccessInmob] = useState('');

  // Características
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [nombreCarac, setNombreCarac] = useState('');
  const [descripcionCarac, setDescripcionCarac] = useState('');
  const [loadingCarac, setLoadingCarac] = useState(false);
  const [errorCarac, setErrorCarac] = useState('');
  const [successCarac, setSuccessCarac] = useState('');

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
      setErrorInmob('');
    } catch (err) {
      console.error('Error completo:', err);
      setErrorInmob(`Error: ${err.message}`);
    }
  };

  const cargarCaracteristicas = async () => {
    try {
      const data = await obtenerCaracteristicas();
      setCaracteristicas(Array.isArray(data) ? data : data.content || []);
      setErrorCarac('');
    } catch (err) {
      console.error('Error completo:', err);
      setErrorCarac(`Error: ${err.message}`);
    }
  };

  const handleCrearInmobiliaria = async (e) => {
    e.preventDefault();
    setErrorInmob('');
    setSuccessInmob('');

    if (!nombreInmob.trim()) {
      setErrorInmob('El nombre es requerido');
      return;
    }

    if (!emailInmob.trim()) {
      setErrorInmob('El email es requerido');
      return;
    }

    if (passwordInmob.length < 8) {
      setErrorInmob('La contraseña debe tener mínimo 8 caracteres');
      return;
    }

    setLoadingInmob(true);

    try {
      await crearInmobiliaria(nombreInmob, emailInmob, passwordInmob);
      setSuccessInmob('¡Inmobiliaria creada exitosamente!');
      setNombreInmob('');
      setEmailInmob('');
      setPasswordInmob('');
      await cargarInmobiliarias();
    } catch (err) {
      setErrorInmob(err.message || 'Error al crear la inmobiliaria');
    } finally {
      setLoadingInmob(false);
    }
  };

  const handleCrearCaracteristica = async (e) => {
    e.preventDefault();
    setErrorCarac('');
    setSuccessCarac('');

    if (!nombreCarac.trim()) {
      setErrorCarac('El nombre es requerido');
      return;
    }

    setLoadingCarac(true);

    try {
      await crearCaracteristica(nombreCarac, descripcionCarac);
      setSuccessCarac('¡Característica creada exitosamente!');
      setNombreCarac('');
      setDescripcionCarac('');
      await cargarCaracteristicas();
    } catch (err) {
      setErrorCarac(err.message || 'Error al crear la característica');
    } finally {
      setLoadingCarac(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
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
                    value={nombreInmob}
                    onChange={(e) => setNombreInmob(e.target.value)}
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
                    value={emailInmob}
                    onChange={(e) => setEmailInmob(e.target.value)}
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
                    value={passwordInmob}
                    onChange={(e) => setPasswordInmob(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength="8"
                    className="form-input"
                  />
                </div>

                {errorInmob && <div className="form-error">{errorInmob}</div>}
                {successInmob && <div className="form-success">{successInmob}</div>}

                <button
                  type="submit"
                  disabled={loadingInmob}
                  className="admin-button"
                >
                  {loadingInmob ? 'Creando...' : 'Crear Inmobiliaria'}
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
                    value={nombreCarac}
                    onChange={(e) => setNombreCarac(e.target.value)}
                    placeholder="ej: Parrilla, Piscina, Garaje"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="descripcion-carac" className="form-label">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    id="descripcion-carac"
                    value={descripcionCarac}
                    onChange={(e) => setDescripcionCarac(e.target.value)}
                    placeholder="Describe esta característica"
                    className="form-input"
                    rows="3"
                  />
                </div>

                {errorCarac && <div className="form-error">{errorCarac}</div>}
                {successCarac && <div className="form-success">{successCarac}</div>}

                <button
                  type="submit"
                  disabled={loadingCarac}
                  className="admin-button"
                >
                  {loadingCarac ? 'Creando...' : 'Crear Característica'}
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
                      {carac.descripcion && <p>{carac.descripcion}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No hay características creadas aún.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




