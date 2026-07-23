import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Megaphone, Calendar, FileText, Download } from 'lucide-react';

const Novedades = () => {
  const [novedad, setNovedad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNovedad = async () => {
      try {
        setLoading(true);
        const res = await api.get('/novedades');
        setNovedad(res.data);
      } catch (err) {
        console.error('Error fetching novelty:', err);
        setError('No se pudo cargar la novedad activa actual.');
      } finally {
        setLoading(false);
      }
    };

    fetchNovedad();
  }, []);

  const getFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5001/images/${url}`;
  };

  const isPdf = novedad?.archivoUrl?.toLowerCase().endsWith('.pdf');

  return (
    <div className="novedades-page">
      <div className="page-header-container">
        <div>
          <h1 className="page-title">Novedades de la Empresa</h1>
          <p className="page-subtitle font-normal">Mantente al tanto de los comunicados, catálogos y ofertas oficiales de WEB LTDA.</p>
        </div>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Cargando novedad activa...</p>
        </div>
      ) : error || !novedad ? (
        <div className="empty-history-state">
          <Megaphone size={48} className="text-muted" />
          <h3>No hay novedades disponibles</h3>
          <p>No se encontraron comunicados o novedades publicadas por la administración en este momento.</p>
        </div>
      ) : (
        <div className="novedad-display-card">
          <div className="novedad-meta-bar">
            <div className="novedad-icon-label">
              <Megaphone size={18} className="text-primary" />
              <strong className="text-primary">Comunicado Oficial Activo</strong>
            </div>
            <div className="novedad-date">
              <Calendar size={14} className="text-muted" />
              <span>
                Publicado el:{' '}
                {new Date(novedad.fechaActualizacion).toLocaleDateString('es-UY', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          <div className="novedad-content-box">
            {isPdf ? (
              <div className="pdf-novedad-container">
                <div className="pdf-info-block">
                  <FileText size={48} className="text-primary mb-3" />
                  <h4>Documento Informativo (PDF)</h4>
                  <p className="text-muted text-sm">
                    La novedad actual está disponible en formato PDF. Haz clic en el botón de abajo para visualizarla o descargarla.
                  </p>
                  <div className="pdf-actions mt-4">
                    <a
                      href={getFileUrl(novedad.archivoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="primary-action-btn no-decor"
                    >
                      <Download size={16} />
                      <span>Abrir Documento PDF</span>
                    </a>
                  </div>
                </div>
                
                {/* Visual preview embedded */}
                <div className="pdf-iframe-wrapper">
                  <iframe 
                    src={getFileUrl(novedad.archivoUrl)} 
                    title="Novedad PDF"
                    className="novedad-pdf-iframe"
                  ></iframe>
                </div>
              </div>
            ) : (
              <div className="image-novedad-container">
                <img
                  src={getFileUrl(novedad.archivoUrl)}
                  alt="Novedad Activa"
                  className="novedad-active-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600?text=Error+al+cargar+novedad';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Novedades;
