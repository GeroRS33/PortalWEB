import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { NotificationContext } from '../context/NotificationContext';
import { 
  Sparkles, 
  Bot, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ShoppingCart, 
  Clock, 
  Package, 
  RefreshCw,
  Zap,
  AlertCircle,
  Send,
  MessageSquare,
  User
} from 'lucide-react';

const AsistenteDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);

  // Q&A State
  const [preguntaInput, setPreguntaInput] = useState('');
  const [askingLoading, setAskingLoading] = useState(false);
  const [historialConsultas, setHistorialConsultas] = useState([]);

  const { addToCart } = useContext(CartContext);
  const { showToast } = useContext(NotificationContext);
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await api.get('/asistente/resumen');
      setSummaryData(res.data);
    } catch (err) {
      console.error('Error fetching assistant summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleOpenDrawer = () => {
    setIsOpen(true);
    fetchSummary();
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  const handleAnalyzeWithAI = async () => {
    try {
      setAiLoading(true);
      setAiError(null);
      const res = await api.post('/asistente/analizar');
      if (res.data && res.data.data) {
        setAiResult(res.data.data);
      } else {
        setAiError('No se pudo obtener una recomendación válida de la IA.');
      }
    } catch (err) {
      console.error('Error analyzing with AI:', err);
      setAiError(err.response?.data?.message || 'Ocurrió un error al consultar con el Asistente WEB.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    const query = preguntaInput.trim();
    if (!query || askingLoading) return;

    try {
      setAskingLoading(true);
      const res = await api.post('/asistente/preguntar', { pregunta: query });
      
      const newEntry = {
        id: Date.now(),
        pregunta: query,
        respuesta: res.data?.respuesta || 'No se recibió respuesta.'
      };

      setHistorialConsultas(prev => {
        const updated = [...prev, newEntry];
        return updated.slice(-5); // Keep at most the last 5 questions
      });

      setPreguntaInput('');
    } catch (err) {
      console.error('Error asking assistant:', err);
      showToast('Error', err.response?.data?.message || 'No se pudo procesar la pregunta.');
    } finally {
      setAskingLoading(false);
    }
  };

  const handleAddSuggestedToCart = async () => {
    if (!aiResult || !aiResult.productosRecomendados || aiResult.productosRecomendados.length === 0) {
      showToast('Información', 'No hay productos sugeridos para agregar.');
      return;
    }

    try {
      const res = await api.get('/productos');
      const catalog = res.data || [];

      let countAdded = 0;
      aiResult.productosRecomendados.forEach(rec => {
        const fullProd = catalog.find(p => p._id === rec.productoId || p.codigo === rec.codigo);
        const qty = rec.cantidadSugerida || 1;

        if (fullProd) {
          addToCart(fullProd, qty);
          countAdded++;
        } else {
          addToCart({
            _id: rec.productoId,
            codigo: rec.codigo,
            nombre: rec.nombre,
            marca: 'WEB LTDA',
            precioSinIVA: 0
          }, qty);
          countAdded++;
        }
      });

      showToast(
        'Productos Agregados', 
        `Se agregaron ${countAdded} ${countAdded === 1 ? 'producto sugerido' : 'productos sugeridos'} a tu carrito de compras.`
      );
      setIsOpen(false);
      navigate('/nuevo-pedido');
    } catch (err) {
      console.error('Error adding suggested items to cart:', err);
      showToast('Error', 'No se pudieron cargar todos los productos en el carrito.');
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'ALTO':
        return <span className="risk-badge risk-high"><AlertTriangle size={14} /> Riesgo ALTO</span>;
      case 'MEDIO':
        return <span className="risk-badge risk-medium"><AlertCircle size={14} /> Riesgo MEDIO</span>;
      case 'BAJO':
        return <span className="risk-badge risk-low"><CheckCircle2 size={14} /> Riesgo BAJO</span>;
      default:
        return <span className="risk-badge risk-low"><CheckCircle2 size={14} /> Riesgo BAJO</span>;
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        className="asistente-floating-trigger"
        onClick={handleOpenDrawer}
        title="Asistente WEB - Inteligencia de Abastecimiento"
      >
        <div className="asistente-icon-glow">
          <Bot size={22} className="asistente-bot-icon" />
          <Sparkles size={12} className="asistente-sparkle-icon" />
        </div>
        <span className="asistente-trigger-text">Asistente WEB</span>
      </button>

      {/* Drawer Overlay Backdrop */}
      {isOpen && (
        <div className="asistente-drawer-backdrop" onClick={handleCloseDrawer}></div>
      )}

      {/* Slide-over Lateral Drawer Panel */}
      <div className={`asistente-drawer-panel ${isOpen ? 'open' : ''}`}>
        <div className="asistente-drawer-header">
          <div className="asistente-header-title-group">
            <div className="asistente-header-icon-box">
              <Bot size={20} color="#ffffff" />
            </div>
            <div>
              <h3 className="asistente-drawer-title">Asistente WEB</h3>
              <p className="asistente-drawer-subtitle">Inteligencia Comercial de Abastecimiento</p>
            </div>
          </div>

          <button className="asistente-drawer-close-btn" onClick={handleCloseDrawer} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="asistente-drawer-body">
          {summaryLoading ? (
            <div className="asistente-loading-box">
              <div className="asistente-spinner"></div>
              <p>Cargando estado de abastecimiento...</p>
            </div>
          ) : summaryData && !aiResult && !aiLoading ? (
            <div className="asistente-initial-section">
              <div className="asistente-section-card">
                <h4 className="asistente-card-label">Estado del Abastecimiento</h4>
                
                <div className="asistente-risk-row">
                  <span className="asistente-risk-label">Nivel de riesgo:</span>
                  {getRiskBadge(summaryData.nivelRiesgo)}
                </div>

                <div className="asistente-metrics-grid">
                  <div className="asistente-metric-box">
                    <Clock size={16} className="text-primary" />
                    <div>
                      <span className="metric-title">Próximo reparto</span>
                      <strong className="metric-value">{summaryData.proximoReparto?.dia || 'Día a confirmar'}</strong>
                      <small className="metric-subtext">Faltan {summaryData.proximoReparto?.horasRestantes || 0} horas</small>
                    </div>
                  </div>

                  <div className="asistente-metric-box">
                    <AlertTriangle size={16} className="text-red" />
                    <div>
                      <span className="metric-title">Sin Stock</span>
                      <strong className="metric-value text-red">{summaryData.productosSinStockCount}</strong>
                      <small className="metric-subtext">productos agotados</small>
                    </div>
                  </div>

                  <div className="asistente-metric-box">
                    <Package size={16} className="text-amber" />
                    <div>
                      <span className="metric-title">Stock Crítico</span>
                      <strong className="metric-value text-amber">{summaryData.productosCriticosCount}</strong>
                      <small className="metric-subtext">bajo nivel seguro</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="asistente-action-cta-box">
                <p className="asistente-cta-description">
                  Obtén un análisis inteligente adaptado a tu historial de compras y tiempo restante para el pedido.
                </p>

                <button 
                  className="asistente-analyze-btn"
                  onClick={handleAnalyzeWithAI}
                >
                  <Sparkles size={18} />
                  <span>Analizar con IA</span>
                </button>
              </div>
            </div>
          ) : aiLoading ? (
            <div className="asistente-loading-box ai-analyzing">
              <Sparkles size={32} className="asistente-sparkle-spin" />
              <h4>Analizando abastecimiento...</h4>
              <p>El Asistente WEB está evaluando tu stock, historial de pedidos y ventana de reparto.</p>
            </div>
          ) : aiResult ? (
            <div className="asistente-result-section">
              <div className="asistente-result-header-card">
                <div className="asistente-result-top-bar">
                  <span className="asistente-result-tag"><Zap size={13} /> Recomendación IA</span>
                  {getRiskBadge(aiResult.nivelRiesgo)}
                </div>

                <h3 className="asistente-result-title">{aiResult.titulo}</h3>
                <p className="asistente-result-resumen">{aiResult.resumen}</p>
              </div>

              <div className={`asistente-main-rec-box ${aiResult.recomiendaHacerPedidoAhora ? 'rec-order-now' : 'rec-wait'}`}>
                <div className="rec-header-row">
                  {aiResult.recomiendaHacerPedidoAhora ? (
                    <Zap size={18} className="text-amber" />
                  ) : (
                    <CheckCircle2 size={18} className="text-green" />
                  )}
                  <strong>Recomendación Principal</strong>
                </div>
                <p className="rec-text">{aiResult.recomendacionPrincipal}</p>
              </div>

              {/* Suggested Products List */}
              {aiResult.productosRecomendados && aiResult.productosRecomendados.length > 0 && (
                <div className="asistente-products-section">
                  <h4 className="asistente-subhead">Productos Recomendados</h4>
                  <div className="asistente-products-list">
                    {aiResult.productosRecomendados.map((item, idx) => (
                      <div key={idx} className="asistente-product-card">
                        <div className="asistente-prod-header">
                          <span className="asistente-prod-code">Cód: {item.codigo}</span>
                          <span className="asistente-prod-stock-badge">
                            Stock actual: <strong>{item.stockActual}</strong>
                          </span>
                        </div>
                        <h5 className="asistente-prod-title">{item.nombre}</h5>
                        <p className="asistente-prod-reason">{item.motivo}</p>

                        <div className="asistente-prod-qty-badge">
                          Cantidad sugerida: <strong>{item.cantidadSugerida} u.</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings List */}
              {aiResult.advertencias && aiResult.advertencias.length > 0 && (
                <div className="asistente-warnings-box">
                  <h4 className="asistente-subhead text-red">
                    <AlertTriangle size={15} /> Advertencias
                  </h4>
                  <ul>
                    {aiResult.advertencias.map((warn, idx) => (
                      <li key={idx}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="asistente-footer-actions">
                {aiResult.productosRecomendados && aiResult.productosRecomendados.length > 0 && (
                  <button 
                    className="asistente-add-cart-btn"
                    onClick={handleAddSuggestedToCart}
                  >
                    <ShoppingCart size={18} />
                    <span>Agregar productos sugeridos al carrito</span>
                  </button>
                )}

                <button 
                  className="asistente-reanalyze-btn"
                  onClick={handleAnalyzeWithAI}
                >
                  <RefreshCw size={14} />
                  <span>Volver a analizar</span>
                </button>
              </div>
            </div>
          ) : aiError ? (
            <div className="asistente-error-state">
              <AlertTriangle size={36} className="text-red" />
              <p>{aiError}</p>
              <button className="secondary-action-btn" onClick={fetchSummary}>
                Reintentar
              </button>
            </div>
          ) : null}

          {/* Section: Consultá al Asistente WEB */}
          <div className="asistente-qa-section">
            <div className="asistente-qa-header">
              <MessageSquare size={16} className="text-primary" />
              <h4 className="asistente-qa-title">Consultá al Asistente WEB</h4>
            </div>

            {/* Q&A Session Cards (max 5) */}
            {historialConsultas.length > 0 && (
              <div className="asistente-qa-history-list">
                {historialConsultas.map((item) => (
                  <div key={item.id} className="asistente-qa-card">
                    <div className="asistente-qa-question-row">
                      <User size={13} className="asistente-user-icon" />
                      <strong>{item.pregunta}</strong>
                    </div>
                    <div className="asistente-qa-answer-row">
                      <Bot size={14} className="asistente-bot-answer-icon" />
                      <p>{item.respuesta}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Question Input Form */}
            <form onSubmit={handleSendQuestion} className="asistente-qa-form">
              <input
                type="text"
                className="asistente-qa-input"
                placeholder="Hacé una pregunta sobre tu stock, pedidos o productos..."
                value={preguntaInput}
                onChange={(e) => setPreguntaInput(e.target.value)}
                disabled={askingLoading}
              />
              <button 
                type="submit" 
                className="asistente-qa-submit-btn" 
                disabled={askingLoading || !preguntaInput.trim()}
                title="Preguntar"
              >
                {askingLoading ? (
                  <RefreshCw size={15} className="asistente-spin" />
                ) : (
                  <>
                    <Send size={15} />
                    <span>Preguntar</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AsistenteDrawer;
