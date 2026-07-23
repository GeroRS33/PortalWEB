import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Tag, Layers, ArrowRight, ClipboardList, Clock, Truck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters
  const [selectedEstado, setSelectedEstado] = useState('Todos');
  const [selectedFechaRange, setSelectedFechaRange] = useState('Todos');

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await api.get('/pedidos');
        setPedidos(res.data);
      } catch (err) {
        console.error('Error fetching client orders:', err);
        setError('No se pudo cargar el historial de pedidos.');
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

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
      case 'Generado': return <Clock size={16} className="text-orange" />;
      case 'Confirmado': return <Clock size={16} className="text-blue" />;
      case 'En preparación': return <Truck size={16} className="text-yellow" />;
      case 'Entregado': return <CheckCircle2 size={16} className="text-green" />;
      case 'Cancelado': return <XCircle size={16} className="text-red" />;
      default: return <AlertCircle size={16} />;
    }
  };

  // Summary counts
  const totalCount = pedidos.length;
  const entregadoCount = pedidos.filter(p => p.estado === 'Entregado').length;
  const preparacionCount = pedidos.filter(p => p.estado === 'En preparación').length;
  const confirmadoCount = pedidos.filter(p => p.estado === 'Confirmado').length;
  const generadoCount = pedidos.filter(p => p.estado === 'Generado').length;
  const canceladoCount = pedidos.filter(p => p.estado === 'Cancelado').length;

  // Filtered orders list
  const filteredPedidos = pedidos.filter(pedido => {
    // State filter match
    if (selectedEstado !== 'Todos') {
      const targetState = selectedEstado === 'Generados' ? 'Generado' :
                          selectedEstado === 'Confirmados' ? 'Confirmado' :
                          selectedEstado === 'En preparación' ? 'En preparación' :
                          selectedEstado === 'Entregados' ? 'Entregado' :
                          selectedEstado === 'Cancelados' ? 'Cancelado' : selectedEstado;
      
      if (pedido.estado !== targetState && pedido.estado !== selectedEstado) return false;
    }

    // Date range filter match
    if (selectedFechaRange !== 'Todos') {
      const dateVal = new Date(pedido.fechaCreacion);
      const now = new Date();
      if (selectedFechaRange === 'Mes') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        if (dateVal < oneMonthAgo) return false;
      } else if (selectedFechaRange === '3Meses') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        if (dateVal < threeMonthsAgo) return false;
      } else if (selectedFechaRange === 'Año') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        if (dateVal < oneYearAgo) return false;
      }
    }

    return true;
  });

  return (
    <div className="mis-pedidos-page">
      {/* Header with Informational Card */}
      <div className="mis-pedidos-header-row">
        <div className="header-left">
          <h1 className="page-title">Mis pedidos</h1>
          <p className="page-subtitle">Acá podés ver el historial de tus pedidos.</p>
        </div>
        
        <div className="detail-limit-info-card">
          <div className="info-card-icon-container">
            <AlertCircle size={20} className="text-primary-blue" />
          </div>
          <div>
            <h4 className="info-card-title">Solo podés ver el detalle de los últimos 2 pedidos.</h4>
            <p className="info-card-desc">Los anteriores muestran la fecha de salida únicamente.</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs below title */}
      <div className="filter-tabs-row">
        {['Todos', 'Generados', 'Confirmados', 'En preparación', 'Entregados', 'Cancelados'].map(tab => {
          const isActive = selectedEstado === tab;
          return (
            <button
              key={tab}
              className={`filter-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedEstado(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Cargando tus pedidos...</p>
        </div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : pedidos.length === 0 ? (
        <div className="empty-history-state">
          <ClipboardList size={48} className="text-muted" />
          <h3>No tienes pedidos aún</h3>
          <p>Los pedidos que realices en el sistema aparecerán listados aquí.</p>
          <Link to="/nuevo-pedido" className="btn-link-action">Hacer un Nuevo Pedido</Link>
        </div>
      ) : (
        <div className="mis-pedidos-content-layout">
          {/* Main List Section */}
          <div className="orders-list-container">
            {filteredPedidos.length === 0 ? (
              <div className="no-results-card">
                <p>No se encontraron pedidos con los filtros aplicados.</p>
              </div>
            ) : (
              <div className="orders-history-grid">
                {filteredPedidos.map((pedido) => {
                  // Index of this order in the complete sorted list
                  const originalIndex = pedidos.findIndex(p => p._id === pedido._id);
                  const canViewDetail = originalIndex < 2;
                  
                  return (
                    <div key={pedido._id} className="order-history-card">
                      <div className="order-card-header">
                        <span className="order-card-code">Pedido #{pedido._id.toString().slice(-6).toUpperCase()}</span>
                        <span className={`status-badge-inline ${getStatusClass(pedido.estado)}`}>
                          {getStatusIcon(pedido.estado)}
                          <span>{pedido.estado}</span>
                        </span>
                      </div>

                      <div className="order-card-body">
                        <div className="order-card-info-row">
                          <Calendar size={14} className="text-muted" />
                          <span>
                            Fecha: {new Date(pedido.fechaCreacion).toLocaleDateString('es-UY', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div className="order-card-info-row">
                          <Layers size={14} className="text-muted" />
                          <span>Productos solicitados: {pedido.totalItems}</span>
                        </div>

                        {pedido.observaciones && (
                          <div className="order-card-obs-block">
                            <strong>Obs:</strong> {pedido.observaciones.length > 80 ? `${pedido.observaciones.slice(0, 80)}...` : pedido.observaciones}
                          </div>
                        )}
                      </div>

                      <div className="order-card-footer">
                        {canViewDetail ? (
                          <Link to={`/detalle-pedido/${pedido._id}`} className="order-card-action-btn">
                            <span>Ver detalle</span>
                            <ArrowRight size={14} />
                          </Link>
                        ) : (
                          <button className="order-card-action-btn-disabled" disabled title="Solo disponible para los últimos 2 pedidos">
                            <span>Ver detalle</span>
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Section */}
          <div className="orders-sidebar-container">
            {/* Box 1: Filtrar Pedidos */}
            <div className="sidebar-filter-card">
              <h3 className="sidebar-card-title">Filtrar pedidos</h3>
              
              <div className="sidebar-form-group">
                <label className="sidebar-form-label">Estado</label>
                <select 
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(e.target.value)}
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Generados">Generados</option>
                  <option value="Confirmados">Confirmados</option>
                  <option value="En preparación">En preparación</option>
                  <option value="Entregados">Entregados</option>
                  <option value="Cancelados">Cancelados</option>
                </select>
              </div>

              <div className="sidebar-form-group">
                <label className="sidebar-form-label">Rango de fechas</label>
                <select
                  value={selectedFechaRange}
                  onChange={(e) => setSelectedFechaRange(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Mes">Último mes</option>
                  <option value="3Meses">Últimos 3 meses</option>
                  <option value="Año">Último año</option>
                </select>
              </div>
            </div>

            {/* Box 2: Resumen de Pedidos */}
            <div className="sidebar-summary-card">
              <h3 className="sidebar-card-title">Resumen de pedidos</h3>
              
              <div className="summary-list">
                <div className="summary-item">
                  <div className="summary-item-label">
                    <ClipboardList size={16} className="text-muted mr-2" />
                    <span>Total de pedidos</span>
                  </div>
                  <span className="summary-item-value font-bold">{totalCount}</span>
                </div>
                
                <div className="summary-item">
                  <div className="summary-item-label">
                    <span className="color-dot bg-green"></span>
                    <span>Entregados</span>
                  </div>
                  <span className="summary-item-value">{entregadoCount}</span>
                </div>

                <div className="summary-item">
                  <div className="summary-item-label">
                    <span className="color-dot bg-orange"></span>
                    <span>En preparación</span>
                  </div>
                  <span className="summary-item-value">{preparacionCount}</span>
                </div>

                <div className="summary-item">
                  <div className="summary-item-label">
                    <span className="color-dot bg-blue"></span>
                    <span>Confirmados</span>
                  </div>
                  <span className="summary-item-value">{confirmadoCount}</span>
                </div>

                <div className="summary-item">
                  <div className="summary-item-label">
                    <span className="color-dot bg-generado-dot"></span>
                    <span>Generados</span>
                  </div>
                  <span className="summary-item-value">{generadoCount}</span>
                </div>

                <div className="summary-item">
                  <div className="summary-item-label">
                    <span className="color-dot bg-red"></span>
                    <span>Cancelados</span>
                  </div>
                  <span className="summary-item-value">{canceladoCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisPedidos;
