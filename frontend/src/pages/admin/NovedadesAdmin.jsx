import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { Megaphone, Calendar, FileText, Upload, Save, HelpCircle } from 'lucide-react';

const NovedadesAdmin = () => {
  const { showToast } = useContext(NotificationContext);

  const [novedad, setNovedad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Update state
  const [archivoUrl, setArchivoUrl] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchNovedad = async () => {
    try {
      setLoading(true);
      const res = await api.get('/novedades');
      setNovedad(res.data);
      setArchivoUrl(res.data.archivoUrl);
    } catch (err) {
      console.error('Error fetching novelty:', err);
      setError('No se pudo cargar la novedad activa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovedad();
  }, []);

  const handleUpdateNovedad = async (e) => {
    e.preventDefault();
    if (!archivoUrl.trim()) {
      showToast('Advertencia', 'El nombre del archivo o URL es requerido');
      return;
    }

    try {
      setUpdating(true);
      const res = await api.post('/novedades', {
        archivoUrl: archivoUrl.trim()
      });

      showToast('Novedad Actualizada', 'La novedad ha sido reemplazada con éxito.');
      setNovedad(res.data);
    } catch (err) {
      console.error('Error updating novelty:', err);
      showToast('Error', err.response?.data?.message || 'No se pudo actualizar la novedad');
    } finally {
      setUpdating(false);
    }
  };

  const getFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5001/images/${url}`;
  };

  const isPdf = novedad?.archivoUrl?.toLowerCase().endsWith('.pdf');

  return (
    <div className="novedades-admin-page">
      <div className="page-header-container">
        <div>
          <h1 className="page-title">Gestión de Novedades</h1>
          <p className="page-subtitle">Actualiza el comunicado o catálogo oficial de la empresa.</p>
        </div>
      </div>

      <div className="admin-novedad-split-grid">
        {/* Left Card: Update form */}
        <div className="stock-table-card p-6 h-fit">
          <h3 className="section-card-title mb-4">Reemplazar Novedad</h3>
          <p className="text-muted text-sm mb-4">
            Escribe el nombre del archivo de novedad (que se encuentre en la carpeta de imágenes o una URL pública). 
            Al guardar, se reemplazará la novedad activa actual de inmediato para todos los clientes.
          </p>

          <form onSubmit={handleUpdateNovedad} className="admin-novedad-form">
            <div className="form-group">
              <label htmlFor="novedad-url">Nombre de archivo o URL:</label>
              <input
                type="text"
                id="novedad-url"
                placeholder="Ej: Novedad.png o mi-archivo.pdf"
                value={archivoUrl}
                onChange={(e) => setArchivoUrl(e.target.value)}
                required
              />
            </div>

            <div className="novedad-file-suggestions mb-4">
              <span className="text-xs font-semibold block mb-1 text-muted">Archivos rápidos sugeridos:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-suggestion-file"
                  onClick={() => setArchivoUrl('Novedad.png')}
                >
                  Novedad.png
                </button>
                <button
                  type="button"
                  className="btn-suggestion-file"
                  onClick={() => setArchivoUrl('CatalogoJulio.pdf')}
                >
                  CatalogoJulio.pdf
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="confirm-order-btn m-0 w-full justify-center"
              disabled={updating}
            >
              <Save size={16} />
              <span>{updating ? 'Guardando...' : 'Actualizar Archivo'}</span>
            </button>
          </form>
          
          <div className="info-box-tip mt-6">
            <HelpCircle size={16} className="text-primary mr-2" />
            <p className="text-xs text-muted">
              El sistema admite archivos en formato **PNG** (imágenes) y **PDF** (documentos). Las novedades PDF se incrustan en un lector interactivo en el portal del cliente.
            </p>
          </div>
        </div>

        {/* Right Card: Preview */}
        <div className="stock-table-card p-6">
          <div className="card-header-flex mb-4">
            <h3 className="section-card-title">Vista Previa Actual</h3>
            {novedad && (
              <span className="text-muted text-xs">
                Última actualización: {new Date(novedad.fechaActualizacion).toLocaleDateString('es-UY')}
              </span>
            )}
          </div>

          {loading ? (
            <div className="loader-container py-12"><div className="loader"></div></div>
          ) : error || !novedad ? (
            <div className="empty-catalog-state p-12">
              <Megaphone size={32} className="text-muted mb-2" />
              <p>No hay novedad activa configurada.</p>
            </div>
          ) : (
            <div className="novedad-preview-box">
              <div className="novedad-meta-bar mb-2">
                <span className="text-xs font-semibold text-primary">Archivo activo: {novedad.archivoUrl}</span>
              </div>
              
              <div className="preview-media-container">
                {isPdf ? (
                  <div className="pdf-preview-box">
                    <FileText size={48} className="text-primary mb-2" />
                    <span className="font-semibold text-sm">Documento PDF Activo</span>
                    <a
                      href={getFileUrl(novedad.archivoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link-action mt-2"
                    >
                      Abrir PDF en pestaña nueva
                    </a>
                  </div>
                ) : (
                  <img
                    src={getFileUrl(novedad.archivoUrl)}
                    alt="Vista Previa de Novedad"
                    className="novedad-preview-img"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400?text=Error+al+cargar+archivo+de+novedad';
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NovedadesAdmin;
