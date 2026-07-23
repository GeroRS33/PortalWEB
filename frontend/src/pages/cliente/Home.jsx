import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import { 
  PlusCircle, ShoppingBag, Layers, Megaphone, AlertCircle, 
  Clock, Truck, CheckCircle2, XCircle, Calendar, Info, ArrowRight, MapPin, X, Bell, FileText, Edit3, Package
} from 'lucide-react';

const Home = () => {
  const { user } = useContext(UserContext);
  const { showToast } = useContext(NotificationContext);
  
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockAlertsCount, setStockAlertsCount] = useState(0);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // Notification center state
  const [notificacionesList, setNotificacionesList] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  const navigate = useNavigate();

  // Helper for notification icons and colors with explicit inline styles
  const getNotificationIcon = (titulo, tipo) => {
    const titleLower = (titulo || '').toLowerCase();

    if (titleLower.includes('generado')) {
      return { 
        icon: <FileText size={15} color="#2563eb" />, 
        style: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' } 
      };
    }
    if (titleLower.includes('confirmado')) {
      return { 
        icon: <CheckCircle2 size={15} color="#4f46e5" />, 
        style: { backgroundColor: '#eef2ff', borderColor: '#c7d2fe' } 
      };
    }
    if (titleLower.includes('preparación') || titleLower.includes('preparacion')) {
      return { 
        icon: <Package size={15} color="#d97706" />, 
        style: { backgroundColor: '#fffbeb', borderColor: '#fde68a' } 
      };
    }
    if (titleLower.includes('entregado')) {
      return { 
        icon: <CheckCircle2 size={15} color="#059669" />, 
        style: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' } 
      };
    }
    if (titleLower.includes('cancelado')) {
      return { 
        icon: <XCircle size={15} color="#dc2626" />, 
        style: { backgroundColor: '#fef2f2', borderColor: '#fecaca' } 
      };
    }
    if (titleLower.includes('modificado') || titleLower.includes('modificación')) {
      return { 
        icon: <Edit3 size={15} color="#7c3aed" />, 
        style: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff' } 
      };
    }
    if (tipo === 'stock' || titleLower.includes('stock')) {
      return { 
        icon: <Layers size={15} color="#ea580c" />, 
        style: { backgroundColor: '#fff7ed', borderColor: '#fed7aa' } 
      };
    }
    if (tipo === 'novedad' || titleLower.includes('novedad')) {
      return { 
        icon: <Megaphone size={15} color="#4338ca" />, 
        style: { backgroundColor: '#eef2ff', borderColor: '#c7d2fe' } 
      };
    }

    return { 
      icon: <Bell size={15} color="#64748b" />, 
      style: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' } 
    };
  };

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await api.get('/pedidos');
        setPedidos(res.data);
      } catch (err) {
        console.error('Error fetching home orders:', err);
        setError('No se pudo cargar el historial de pedidos recientes.');
      } finally {
        setLoading(false);
      }
    };

    const checkStockAlerts = async () => {
      try {
        const res = await api.get('/stock');
        const affectedItems = res.data.filter(
          item => item.cantidad === 0 || item.cantidad <= item.productoId.stockCritico
        );
        const count = affectedItems.length;
        setStockAlertsCount(count);

        if (count > 0 && !sessionStorage.getItem('stock_notified')) {
          showToast(
            'Alerta de Stock',
            `Atención: Tienes ${count} ${count === 1 ? 'producto afectado' : 'productos afectados'} con stock bajo o agotados.`
          );
          sessionStorage.setItem('stock_notified', 'true');
        }
      } catch (err) {
        console.error('Error checking stock alerts:', err);
      }
    };

    const fetchNotificationsFeed = async () => {
      try {
        setNotifLoading(true);
        const res = await api.get('/notificaciones?all=true');
        setNotificacionesList(res.data);
      } catch (err) {
        console.error('Error fetching notification center feed:', err);
      } finally {
        setNotifLoading(false);
      }
    };

    fetchPedidos();
    checkStockAlerts();
    fetchNotificationsFeed();
  }, [showToast]);

  // Relative time helper
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} hs`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 30) return `Hace ${diffInDays} días`;
    return date.toLocaleDateString('es-UY');
  };

  // Helper for delivery calculations
  const getNextDeliveryInfo = (diaNombre) => {
    if (!diaNombre) return { dateStr: 'Por confirmar', daysLeftText: '', daysUntil: 7 };
    
    const mapDias = {
      'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3, 'miércoles': 3,
      'jueves': 4, 'viernes': 5, 'sabado': 6, 'sábado': 6
    };
    
    const targetDay = mapDias[diaNombre.toLowerCase()] ?? 5;
    const today = new Date();
    const currentDay = today.getDay();
    
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) {
      daysUntil += 7;
    }
    
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysUntil);
    
    const dayNameCapitalized = diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1);
    const dateFormatted = `${dayNameCapitalized} ${nextDate.getDate().toString().padStart(2, '0')}/${(nextDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    let daysLeftText = `Faltan ${daysUntil} días`;
    if (daysUntil === 1) daysLeftText = '¡Falta 1 día!';
    else if (daysUntil === 0) daysLeftText = '¡Es hoy!';

    return {
      dateStr: dateFormatted,
      daysLeftText,
      daysUntil
    };
  };

  const deliveryInfo = getNextDeliveryInfo(user?.diaReparto);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Generado': return 'badge-generado';
      case 'Confirmado': return 'badge-confirmado';
      case 'En preparación': return 'badge-preparacion';
      case 'Entregado': return 'badge-entregado';
      case 'Cancelado': return 'badge-cancelado';
      default: return 'badge-neutral';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Generado': return <Clock size={18} className="status-icon text-orange" />;
      case 'Confirmado': return <Clock size={18} className="status-icon text-blue" />;
      case 'En preparación': return <Truck size={18} className="status-icon text-yellow" />;
      case 'Entregado': return <CheckCircle2 size={18} className="status-icon text-green" />;
      case 'Cancelado': return <XCircle size={18} className="status-icon text-red" />;
      default: return <AlertCircle size={18} className="status-icon" />;
    }
  };

  const ultimoPedido = pedidos.length > 0 ? pedidos[0] : null;
  const pedidosRecientes = pedidos.slice(0, 3);

  return (
    <div className="home-page">
      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">¡Hola, {user.nombre}!</h1>
          <p className="welcome-subtitle">
            Gestiona tus pedidos y stock con WEB LTDA. Tu próximo reparto está programado para el día <strong>{user.diaReparto}</strong>.
          </p>
        </div>
        <button className="primary-action-btn" onClick={() => navigate('/nuevo-pedido')}>
          <PlusCircle size={18} />
          <span>Nuevo Pedido</span>
        </button>
      </div>

      {/* Main Grid: Left Column (2fr) & Right Notification Center (1fr) */}
      <div className="home-dashboard-grid-v2">
        {/* Left Operations Column */}
        <div className="home-main-col-v2">
          {/* Stock Alert Card */}
          {stockAlertsCount > 0 && (
            <div className="stock-alert-banner">
              <div className="stock-alert-banner-content">
                <AlertCircle size={24} className="stock-alert-banner-icon" />
                <div>
                  <h4 className="stock-alert-banner-title">¡Alerta de Inventario!</h4>
                  <p className="stock-alert-banner-desc">
                    Tienes <strong>{stockAlertsCount}</strong> {stockAlertsCount === 1 ? 'producto' : 'productos'} con stock crítico o agotados en tu stock.
                  </p>
                </div>
              </div>
              <Link to="/mi-stock" className="stock-alert-banner-link">
                Administrar Mi Stock &rarr;
              </Link>
            </div>
          )}

          {/* Latest Order Card */}
          <div className="dashboard-card latest-order-card">
            {loading ? (
              <div className="loader-container"><div className="loader"></div></div>
            ) : ultimoPedido ? (
              <div className="latest-order-content">
                <div className="latest-order-header">
                  <div>
                    <h3 className="card-title-compact">Estado de tu último pedido</h3>
                    <div className="order-meta-sub">
                      <span className="order-number font-bold">Pedido #{ultimoPedido._id.toString().slice(-6).toUpperCase()}</span>
                      <span className="order-date-bullet">•</span>
                      <span className="order-date">
                        {new Date(ultimoPedido.fechaCreacion).toLocaleDateString('es-UY', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusClass(ultimoPedido.estado)}`}>
                    {ultimoPedido.estado}
                  </span>
                </div>
                
                <div className="latest-order-progress">
                  <div className="progress-step-container">
                    <div className="progress-connector"></div>
                    <div className="step-nodes">
                      <div className={`step-node generado ${['Generado', 'Confirmado', 'En preparación', 'Entregado'].includes(ultimoPedido.estado) ? 'active' : ''}`}>
                        <div className="step-node-bubble"><FileText size={13} /></div>
                        <span>Generado</span>
                      </div>
                      <div className={`step-node confirmado ${['Confirmado', 'En preparación', 'Entregado'].includes(ultimoPedido.estado) ? 'active' : ''}`}>
                        <div className="step-node-bubble"><CheckCircle2 size={13} /></div>
                        <span>Confirmado</span>
                      </div>
                      <div className={`step-node preparacion ${['En preparación', 'Entregado'].includes(ultimoPedido.estado) ? 'active' : ''}`}>
                        <div className="step-node-bubble"><Package size={13} /></div>
                        <span>En preparación</span>
                      </div>
                      <div className={`step-node entregado ${ultimoPedido.estado === 'Entregado' ? 'active' : ''}`}>
                        <div className="step-node-bubble"><CheckCircle2 size={13} /></div>
                        <span>Entregado</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="latest-order-footer">
                  <span>Total de productos: {ultimoPedido.totalItems}</span>
                  <Link to={`/detalle-pedido/${ultimoPedido._id}`} className="view-detail-link">
                    Ver detalle completo &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="empty-dashboard-state">
                <AlertCircle size={32} className="text-muted" />
                <p>Aún no has realizado ningún pedido.</p>
                <Link to="/nuevo-pedido" className="text-link">Realiza tu primer pedido aquí</Link>
              </div>
            )}
          </div>

          {/* Sub-grid (50% - 50%): Historial Reciente & Próximo reparto */}
          <div className="home-bottom-subgrid">
            {/* Box 1: Historial Reciente */}
            <div className="dashboard-card recent-history-subcard">
              <div className="card-header-with-action mb-2">
                <h3 className="card-title-compact">Historial Reciente</h3>
                <Link to="/mis-pedidos" className="view-all-link">Ver todos</Link>
              </div>

              {loading ? (
                <div className="loader-container py-4"><div className="loader"></div></div>
              ) : pedidosRecientes.length > 0 ? (
                <div className="recent-orders-list-compact">
                  {pedidosRecientes.map((p) => (
                    <div key={p._id} className="recent-order-item-compact">
                      <div className="order-meta">
                        <div className="recent-order-icon-box">
                          <ShoppingBag size={16} className="text-primary-blue" />
                        </div>
                        <div className="order-info-text">
                          <span className="order-code font-bold">#{p._id.toString().slice(-6).toUpperCase()}</span>
                          <span className="order-date-text">
                            {new Date(p.fechaCreacion).toLocaleDateString('es-UY')}
                          </span>
                        </div>
                      </div>
                      <div className="order-summary-right">
                        <Link to={`/detalle-pedido/${p._id}`} className="icon-detail-btn-sm" title="Ver Detalle">
                          Ver
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-dashboard-state py-4">
                  <p>No hay pedidos recientes.</p>
                </div>
              )}
            </div>

            {/* Box 2: Próximo reparto */}
            <div className="dashboard-card next-delivery-subcard">
              <div className="next-delivery-inner-split">
                {/* Left Half: Delivery Date Info */}
                <div className="next-delivery-left-half">
                  <div className="next-delivery-card-header">
                    <div className="delivery-icon-box">
                      <Truck size={20} />
                    </div>
                    <div className="delivery-header-title-block">
                      <span className="delivery-card-label">Próximo reparto</span>
                      <span className="delivery-days-left-badge">{deliveryInfo.daysLeftText}</span>
                    </div>
                  </div>

                  <div className="next-delivery-body py-1">
                    <h2 className="next-delivery-date-text">{deliveryInfo.dateStr}</h2>
                    <div className="delivery-time-range-row">
                      <Clock size={14} className="text-muted" />
                      <span>08:00 - 12:00 hs</span>
                    </div>
                  </div>

                  <div className="next-delivery-footer pt-2">
                    <button className="delivery-info-link-btn" onClick={() => setShowDeliveryModal(true)}>
                      <span>Ver información</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Right Half: 48hs Cutoff Notice Box */}
                <div className="next-delivery-cutoff-box">
                  <div className="cutoff-box-header">
                    <Clock size={16} className="cutoff-box-icon" />
                    <span className="cutoff-box-title">Cierre de pedidos</span>
                  </div>
                  <p className="cutoff-box-text">
                    Los pedidos deben realizarse con al menos <strong>48 hs de anticipación</strong> a tu día de reparto.
                  </p>
                  <span className="cutoff-box-badge">Plazo límite: 48 hs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Notification Center Column (Full Height) */}
        <div className="home-side-col-v2">
          <div className="dashboard-card notification-center-card">
            <div className="notification-center-header">
              <div className="notif-header-title-group">
                <Bell size={20} className="text-primary-blue" />
                <h3 className="card-title-compact mb-0">Centro de Notificaciones</h3>
              </div>
              {notificacionesList.length > 0 && (
                <span className="notif-count-pill">{notificacionesList.length}</span>
              )}
            </div>

            <div className="notification-center-body">
              {notifLoading ? (
                <div className="loader-container py-12"><div className="loader"></div></div>
              ) : notificacionesList.length > 0 ? (
                <div className="notifications-feed-list">
                  {notificacionesList.map(n => {
                    const notifVisual = getNotificationIcon(n.titulo, n.tipo);
                    return (
                      <div key={n._id} className="notification-feed-item">
                        <div className="notif-feed-icon-wrapper" style={notifVisual.style}>
                          {notifVisual.icon}
                        </div>
                        <div className="notif-feed-text-block">
                          <div className="notif-feed-header-line">
                            <span className="notif-feed-title">{n.titulo}</span>
                            <span className="notif-feed-time">{getTimeAgo(n.fecha || n.createdAt)}</span>
                          </div>
                          <p className="notif-feed-message">{n.mensaje}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-notif-state py-8">
                  <Bell size={32} className="text-muted opacity-40 mb-2" />
                  <p className="text-sm font-semibold text-muted">Sin notificaciones recientes</p>
                  <span className="text-xs text-muted">Aquí verás los cambios de estado de tus pedidos, stock y novedades.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Information Modal */}
      {showDeliveryModal && (
        <div className="modal-overlay">
          <div className="delivery-info-modal">
            <div className="modal-close-header">
              <h3 className="modal-delivery-title">Información de Reparto</h3>
              <button className="modal-close-icon-btn" onClick={() => setShowDeliveryModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-delivery-body">
              <div className="delivery-info-item">
                <Calendar size={18} className="text-primary-blue" />
                <div>
                  <strong>Día habitual de entrega:</strong>
                  <p>Todos los {user?.diaReparto}s en el horario de 08:00 a 12:00 hs.</p>
                </div>
              </div>

              <div className="delivery-info-item">
                <MapPin size={18} className="text-primary-blue" />
                <div>
                  <strong>Dirección de entrega registrada:</strong>
                  <p>{user?.direccion}</p>
                </div>
              </div>

              <div className="delivery-info-item">
                <Clock size={18} className="text-primary-blue" />
                <div>
                  <strong>Cierre de pedidos:</strong>
                  <p>Para asegurar que tus productos se carguen en la primera ola del camión, debes realizar el pedido con un mínimo de <strong>48 horas de anticipación</strong>.</p>
                </div>
              </div>

              <div className="delivery-modal-alert">
                <Info size={16} />
                <span>Si realizas el pedido fuera del horario de corte, quedará programado automáticamente para el siguiente ciclo de reparto.</span>
              </div>
            </div>

            <div className="modal-delivery-actions">
              <button className="secondary-action-btn" onClick={() => setShowDeliveryModal(false)}>
                Cerrar
              </button>
              <button className="primary-action-btn" onClick={() => { setShowDeliveryModal(false); navigate('/nuevo-pedido'); }}>
                <PlusCircle size={16} />
                <span>Hacer Pedido Ahora</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
