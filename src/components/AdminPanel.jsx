import { useState, useEffect } from 'react';
import { logout, crearInmobiliaria, obtenerInmobiliarias, crearCaracteristica, obtenerCaracteristicas } from '../auth';
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
  descripcion: '',
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
      await crearCaracteristica(caracteristicaForm.nombre, caracteristicaForm.descripcion);
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

                <div className="form-group">
                  <label htmlFor="descripcion-carac" className="form-label">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    id="descripcion-carac"
                    value={caracteristicaForm.descripcion}
                    onChange={(e) => setCaracteristicaForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Describe esta característica"
                    className="form-input"
                    rows="3"
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




