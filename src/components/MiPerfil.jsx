import { useEffect, useMemo, useState } from 'react';
import {
  getUserEmail,
  getUserIcon,
  getUserId,
  getUserName,
  getUserRole,
  logout,
  uploadUserImage,
} from '../auth';

function getRoleLabel(userRole) {
  if (userRole === 'administrador') return '👑 Administrador';
  if (userRole === 'inmobiliaria') return '🏢 Inmobiliaria';
  return '👤 Comprador';
}

export function MiPerfil() {
  const userName = getUserName() || 'Usuario';
  const userRole = getUserRole();
  const userId = getUserId() || 'N/A';
  const userEmail = getUserEmail() || 'Sin email disponible';

  const [avatarUrl, setAvatarUrl] = useState(getUserIcon() || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const currentAvatar = useMemo(() => previewUrl || avatarUrl, [previewUrl, avatarUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [currentAvatar]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setError('');
    setSuccess('');

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    if (!(file instanceof File)) {
      setError('No se pudo leer el archivo seleccionado.');
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Solo puedes subir archivos de imagen.');
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    const maxSizeMb = 5;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB.');
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Selecciona una imagen antes de subirla.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await uploadUserImage(selectedFile);
      const savedUrl = response?.url || '';
      setAvatarUrl(getUserIcon() || savedUrl);
      setSelectedFile(null);
      setPreviewUrl('');
      setSuccess('Foto de perfil actualizada correctamente.');
    } catch (uploadError) {
      setError(uploadError.message || 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="profile-header-content">
          <h1 className="profile-logo-text">🏠 Compra Tu Hogar</h1>
          <nav className="profile-nav" aria-label="Navegacion principal">
            <a href="/home" className="profile-nav-link">Home</a>
            <button type="button" className="profile-logout-btn" onClick={handleLogout}>
              Cerrar Sesion
            </button>
          </nav>
        </div>
      </header>

      <main className="profile-main">
        <section className="profile-card">
          <h2 className="profile-title">Tu Perfil</h2>
          <div className="profile-avatar-wrapper">
            {currentAvatar && !avatarLoadError ? (
              <img
                src={currentAvatar}
                alt={`Foto de perfil de ${userName}`}
                className="profile-avatar"
                onError={() => setAvatarLoadError(true)}
              />
            ) : (
              <div className="profile-avatar-placeholder">{userName.charAt(0).toUpperCase()}</div>
            )}
          </div>

          <p className="profile-text"><strong>Nombre:</strong> {userName}</p>
          <p className="profile-text"><strong>Email:</strong> {userEmail}</p>
          <p className="profile-text"><strong>Rol:</strong> {getRoleLabel(userRole)}</p>
          <p className="profile-text"><strong>ID de usuario:</strong> {userId}</p>
          <p className="profile-text"><strong>Estado:</strong> ✅ Verificado</p>
        </section>

        <section className="profile-upload-card">
          <h3 className="profile-upload-title">Actualizar foto</h3>
          <p className="profile-upload-help">Selecciona una imagen JPG, PNG o WEBP de hasta 5MB.</p>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="profile-file-input"
            disabled={uploading}
          />

          <button
            type="button"
            className="profile-upload-btn"
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
          >
            {uploading ? 'Subiendo...' : 'Guardar foto'}
          </button>

          {error && <p className="profile-message profile-message-error">{error}</p>}
          {success && <p className="profile-message profile-message-success">{success}</p>}
        </section>
      </main>
    </div>
  );
}



