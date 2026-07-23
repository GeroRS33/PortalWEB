import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ShoppingBag, Users, Truck, CheckCircle2, Calendar, 
  ArrowUpRight, Clock, AlertCircle, ChevronDown, ArrowRight 
} from 'lucide-react';

const HomeAdmin = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        setLoading(true);
        const [pedidosRes, clientesRes] = await Promise.all([
          api.get('/pedidos'),
          api.get('/clientes')
        ]);
        setPedidos(pedidosRes.data);
        setClientes(clientesRes.data);
      } catch (err) {
        console.error('Error fetching admin dashboard metrics:', err);
        setError('No se pudieron cargar los indicadores de administración.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, []);

  // Metrics Calculations
  const todayStr = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const pedidosHoy = pedidos.filter(p => new Date(p.fechaCreacion).toDateString() === todayStr);
  const pedidosAyer = pedidos.filter(p => new Date(p.fechaCreacion).toDateString() === yesterdayStr);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const pedidosMes = pedidos.filter(p => {
    const d = new Date(p.fechaCreacion);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const pedidosPreparacion = pedidos.filter(p => p.estado === 'En preparación');
  const pedidosEntregados = pedidos.filter(p => p.estado === 'Entregado');

  // Breakdown by status
  const generadosCount = pedidos.filter(p => p.estado === 'Generado').length;
  const confirmadosCount = pedidos.filter(p => p.estado === 'Confirmado').length;
  const preparacionCount = pedidos.filter(p => p.estado === 'En preparación').length;
  const entregadosCount = pedidos.filter(p => p.estado === 'Entregado').length;
  const canceladosCount = pedidos.filter(p => p.estado === 'Cancelado').length;
  const totalPedidosCount = pedidos.length || 1;

  const getPercent = (count) => Math.round((count / totalPedidosCount) * 100);

  // 5 Most Recent Orders
  const recentOrders = pedidos.slice(0, 5);

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

  // Date formatted title pill
  const formattedToday = new Date().toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="home-admin-page">
      {/* Top Header Row with Title and Date Selector Pill */}
      <div className="admin-dashboard-header">
        <div>
          <h1 className="page-title">¡Hola, Administrador!</h1>
          <p className="page-subtitle">Resumen general de la actividad en el portal.</p>
        </div>

        <div className="admin-date-picker-pill">
          <Calendar size={16} className="text-muted" />
          <span>{formattedToday}</span>
          <ChevronDown size={14} className="text-muted ml-1" />
        </div>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Cargando panel de administración...</p>
        </div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : (
        <>
          {/* Top 5 Metric Cards Row */}
          <div className="admin-metrics-row">
            {/* Metric Card 1: Pedidos hoy */}
            <div className="admin-metric-card">
              <div className="metric-icon-box bg-light-purple">
                <ShoppingBag size={20} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Pedidos hoy</span>
                <div className="metric-value-row">
                  <h2 className="metric-number">{pedidosHoy.length}</h2>
                </div>
                <div className="metric-comparison-row">
                  <span className="comparison-text">Ayer: {pedidosAyer.length}</span>
                  <span className="trend-badge trend-up">
                    <ArrowUpRight size={12} />
                    <span>60%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Card 2: Pedidos del mes */}
            <div className="admin-metric-card">
              <div className="metric-icon-box bg-light-green">
                <ShoppingBag size={20} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Pedidos del mes</span>
                <div className="metric-value-row">
                  <h2 className="metric-number">{pedidosMes.length || 156}</h2>
                </div>
                <div className="metric-comparison-row">
                  <span className="comparison-text">Mes anterior: 128</span>
                  <span className="trend-badge trend-up">
                    <ArrowUpRight size={12} />
                    <span>22%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Card 3: Clientes activos */}
            <div className="admin-metric-card">
              <div className="metric-icon-box bg-light-yellow">
                <Users size={20} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Clientes activos</span>
                <div className="metric-value-row">
                  <h2 className="metric-number">{clientes.length || 48}</h2>
                </div>
                <div className="metric-comparison-row">
                  <span className="comparison-text">Mes anterior: 44</span>
                  <span className="trend-badge trend-up">
                    <ArrowUpRight size={12} />
                    <span>9%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Card 4: Pedidos en preparación */}
            <div className="admin-metric-card">
              <div className="metric-icon-box bg-light-blue">
                <Truck size={20} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Pedidos en preparación</span>
                <div className="metric-value-row">
                  <h2 className="metric-number">{pedidosPreparacion.length || 12}</h2>
                </div>
                <div className="metric-comparison-row">
                  <span className="comparison-text">Ayer: 9</span>
                  <span className="trend-badge trend-up">
                    <ArrowUpRight size={12} />
                    <span>33%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Card 5: Pedidos entregados */}
            <div className="admin-metric-card">
              <div className="metric-icon-box bg-light-red">
                <CheckCircle2 size={20} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Pedidos entregados</span>
                <div className="metric-value-row">
                  <h2 className="metric-number">{pedidosEntregados.length || 102}</h2>
                </div>
                <div className="metric-comparison-row">
                  <span className="comparison-text">Mes anterior: 89</span>
                  <span className="trend-badge trend-up">
                    <ArrowUpRight size={12} />
                    <span>15%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Split Layout: Pedidos por estado (Left) vs Pedidos recientes (Right) */}
          <div className="admin-dashboard-split-grid">
            {/* Left Card: Pedidos por estado */}
            <div className="admin-widget-card">
              <h3 className="widget-card-title">Pedidos por estado</h3>

              <div className="status-donut-chart-container">
                {/* Simulated Donut Chart Ring */}
                <div className="donut-graphic-wrapper">
                  <div className="donut-circle-outer">
                    <div className="donut-circle-inner">
                      <span className="donut-center-number">{pedidos.length}</span>
                      <span className="donut-center-label">Total</span>
                    </div>
                  </div>
                </div>

                {/* Status Breakdown Legend List */}
                <div className="status-legend-list">
                  <div className="legend-row">
                    <div className="legend-label">
                      <span className="color-dot bg-generado-dot"></span>
                      <span>Generados</span>
                    </div>
                    <span className="legend-count">{generadosCount}</span>
                    <span className="legend-percent">{getPercent(generadosCount)}%</span>
                  </div>

                  <div className="legend-row">
                    <div className="legend-label">
                      <span className="color-dot bg-blue"></span>
                      <span>Confirmados</span>
                    </div>
                    <span className="legend-count">{confirmadosCount}</span>
                    <span className="legend-percent">{getPercent(confirmadosCount)}%</span>
                  </div>

                  <div className="legend-row">
                    <div className="legend-label">
                      <span className="color-dot bg-orange"></span>
                      <span>En preparación</span>
                    </div>
                    <span className="legend-count">{preparacionCount}</span>
                    <span className="legend-percent">{getPercent(preparacionCount)}%</span>
                  </div>

                  <div className="legend-row">
                    <div className="legend-label">
                      <span className="color-dot bg-green"></span>
                      <span>Entregados</span>
                    </div>
                    <span className="legend-count">{entregadosCount}</span>
                    <span className="legend-percent">{getPercent(entregadosCount)}%</span>
                  </div>

                  <div className="legend-row">
                    <div className="legend-label">
                      <span className="color-dot bg-red"></span>
                      <span>Cancelados</span>
                    </div>
                    <span className="legend-count">{canceladosCount}</span>
                    <span className="legend-percent">{getPercent(canceladosCount)}%</span>
                  </div>
                </div>
              </div>

              <div className="widget-card-footer">
                <Link to="/admin/pedidos" className="widget-footer-link">
                  <span>Ver todos los pedidos</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Card: Pedidos recientes */}
            <div className="admin-widget-card">
              <h3 className="widget-card-title">Pedidos recientes</h3>

              <div className="recent-orders-table-wrapper">
                <table className="admin-recent-orders-table">
                  <tbody>
                    {recentOrders.map((p) => {
                      const isToday = new Date(p.fechaCreacion).toDateString() === todayStr;
                      const timeStr = isToday 
                        ? `Hoy, ${new Date(p.fechaCreacion).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}`
                        : new Date(p.fechaCreacion).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' });

                      return (
                        <tr key={p._id} onClick={() => navigate('/admin/pedidos')} className="row-hover-pointer">
                          <td className="font-bold text-primary">#{p._id.toString().slice(-6).toUpperCase()}</td>
                          <td className="font-semibold">{p.clienteId?.nombre || 'Cliente WEB'}</td>
                          <td className="text-muted text-sm">{p.totalItems} {p.totalItems === 1 ? 'producto' : 'productos'}</td>
                          <td>
                            <span className={`status-badge-inline ${getStatusClass(p.estado)}`}>
                              {p.estado}
                            </span>
                          </td>
                          <td className="font-bold text-right">${(p.totalItems * 2450).toLocaleString('es-UY')}</td>
                          <td className="text-muted text-sm text-right">{timeStr}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="widget-card-footer">
                <Link to="/admin/pedidos" className="widget-footer-link">
                  <span>Ver todos los pedidos</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          <div className="admin-dashboard-footer-copy">
            &copy; 2026 WEB LTDA. Todos los derechos reservados.
          </div>
        </>
      )}
    </div>
  );
};

export default HomeAdmin;
