import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { Search, ShoppingBag, Calendar, User, Clock, Check, X, ShieldAlert, ArrowRight, Eye, Trash2, Edit, Maximize2 } from 'lucide-react';

const PedidosAdmin = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(NotificationContext);
  
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Detail Modal State
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // State changes state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  // Item modification state
  const [editingItems, setEditingItems] = useState(false);
  const [modifiedQty, setModifiedQty] = useState({}); // { productDetailId: qty }
  const [modificationReason, setModificationReason] = useState('');

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/pedidos?search=${encodeURIComponent(search)}`);
      setPedidos(res.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError('No se pudo cargar la lista de pedidos de clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPedidos();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpenDetail = async (pedido) => {
    try {
      setLoadingDetails(true);
      setSelectedPedido(pedido);
      const res = await api.get(`/pedidos/${pedido._id}`);
      setSelectedDetails(res.data.details);
      
      // Initialize modification state
      const initialQty = {};
      res.data.details.forEach(item => {
        initialQty[item.productoId._id] = item.cantidad;
      });
      setModifiedQty(initialQty);
      setEditingItems(false);
      setModificationReason('');
    } catch (err) {
      console.error('Error fetching order detail:', err);
      showToast('Error', 'No se pudo cargar el detalle del pedido');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusChangeRequest = async (status) => {
    if (status === 'Cancelado') {
      setTargetStatus(status);
      setStatusReason('');
      setShowStatusModal(true);
    } else {
      try {
        setLoadingDetails(true);
        await api.put(`/pedidos/${selectedPedido._id}/estado`, {
          nuevoEstado: status,
          motivo: `Cambio de estado a ${status} realizado por la administración.`
        });

        showToast('Estado Actualizado', `El pedido ha cambiado a: ${status}`);
        
        // Reload order and details
        const updatedRes = await api.get(`/pedidos/${selectedPedido._id}`);
        setSelectedPedido(updatedRes.data.pedido);
        setSelectedDetails(updatedRes.data.details);
        
        // Refresh list
        fetchPedidos();
      } catch (err) {
        console.error('Error updating status:', err);
        showToast('Error', err.response?.data?.message || 'No se pudo cambiar el estado');
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!statusReason.trim()) {
      showToast('Advertencia', 'Debe ingresar un motivo para cambiar el estado');
      return;
    }

    try {
      await api.put(`/pedidos/${selectedPedido._id}/estado`, {
        nuevoEstado: targetStatus,
        motivo: statusReason
      });

      showToast('Estado Actualizado', `El pedido ha cambiado a: ${targetStatus}`);
      setShowStatusModal(false);
      
      // Reload order and details
      const updatedRes = await api.get(`/pedidos/${selectedPedido._id}`);
      setSelectedPedido(updatedRes.data.pedido);
      setSelectedDetails(updatedRes.data.details);
      
      // Refresh list
      fetchPedidos();
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Error', err.response?.data?.message || 'No se pudo cambiar el estado');
    }
  };

  const handleSaveItemModifications = async () => {
    if (!modificationReason.trim()) {
      showToast('Advertencia', 'Debe ingresar un motivo para realizar modificaciones en los productos');
      return;
    }

    // Prepare payload
    const itemsPayload = Object.keys(modifiedQty).map(productId => ({
      productoId: productId,
      cantidad: modifiedQty[productId]
    }));

    try {
      await api.put(`/pedidos/${selectedPedido._id}/items`, {
        items: itemsPayload,
        motivo: modificationReason
      });

      showToast('Pedido Modificado', 'Los productos del pedido han sido modificados.');
      setEditingItems(false);
      
      // Reload details
      const updatedRes = await api.get(`/pedidos/${selectedPedido._id}`);
      setSelectedPedido(updatedRes.data.pedido);
      setSelectedDetails(updatedRes.data.details);
      
      // Refresh list
      fetchPedidos();
    } catch (err) {
      console.error('Error modifying order items:', err);
      showToast('Error', err.response?.data?.message || 'No se pudieron modificar los productos');
    }
  };

  const handleQtyEdit = (productId, newQty, originalQty) => {
    const qty = Math.max(0, parseInt(newQty, 10) || 0);
    
    // Rule: cannot increase quantity
    if (qty > originalQty) {
      showToast('Acción inválida', 'No se permite aumentar la cantidad de los productos');
      return;
    }

    setModifiedQty(prev => ({
      ...prev,
      [productId]: qty
    }));
  };

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

  const getNextStates = (currentStatus) => {
    if (currentStatus === 'Entregado' || currentStatus === 'Cancelado') return [];
    if (currentStatus === 'Generado') return ['Confirmado', 'Cancelado'];
    if (currentStatus === 'Confirmado') return ['En preparación', 'Cancelado'];
    if (currentStatus === 'En preparación') return ['Entregado', 'Cancelado'];
    return [];
  };

  const getProductImageUrl = (filename) => {
    if (!filename) return 'https://via.placeholder.com/50?text=Sin+Imagen';
    return `http://localhost:5001/images/ImagenesCatalogo/${filename}`;
  };

  return (
    <div className="admin-pedidos-page">
      <div className="page-header-container">
        <div>
          <h1 className="page-title">Gestión de Pedidos</h1>
          <p className="page-subtitle">Panel de operaciones comerciales para WEB LTDA.</p>
        </div>
      </div>

      <div className="stock-actions-bar">
        <div className="search-bar-container max-w-md">
          <Search size={18} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Buscar por cliente, código o nro pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading && pedidos.length === 0 ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Cargando lista de pedidos...</p>
        </div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : pedidos.length === 0 ? (
        <div className="empty-catalog-state">
          <p>No se encontraron pedidos registrados.</p>
        </div>
      ) : (
        <div className="stock-table-card">
          <div className="detail-table-wrapper">
            <table className="detail-table">
              <thead>
                <tr>
                  <th>Nro Pedido</th>
                  <th>Cliente</th>
                  <th>Cód Cliente</th>
                  <th>Fecha de Solicitud</th>
                  <th>Artículos</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p._id} className="row-hover-pointer" onClick={() => handleOpenDetail(p)}>
                    <td className="font-semibold text-primary">#{p._id.toString().slice(-6).toUpperCase()}</td>
                    <td>{p.clienteId?.nombre || 'Desconocido'}</td>
                    <td className="table-item-code">{p.clienteId?.codigoCliente || 'N/A'}</td>
                    <td>
                      {new Date(p.fechaCreacion).toLocaleDateString('es-UY', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>{p.totalItems} uds</td>
                    <td>
                      <span className={`status-badge-inline ${getStatusClass(p.estado)}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="text-right">
                      <button 
                        className="btn-action-view" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(p);
                        }}
                      >
                        <Eye size={14} />
                        <span>Detalle</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedPedido && (
        <div className="modal-overlay">
          <div className="admin-detail-modal">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Detalle de Pedido #{selectedPedido._id.toString().slice(-6).toUpperCase()}</h3>
                <p className="modal-subtitle">
                  Solicitado el {new Date(selectedPedido.fechaCreacion).toLocaleString('es-UY')}
                </p>
              </div>
              <div className="modal-header-actions-right">
                <button 
                  className="modal-action-expand-btn"
                  onClick={() => navigate(`/admin/pedidos/${selectedPedido._id}`)}
                  title="Abrir en página completa"
                >
                  <Maximize2 size={16} />
                  <span>Ver en página completa</span>
                </button>
                <button className="modal-close-x" onClick={() => setSelectedPedido(null)}>&times;</button>
              </div>
            </div>

            {loadingDetails ? (
              <div className="loader-container py-12"><div className="loader"></div></div>
            ) : (
              <div className="modal-body-scrollable">
                <div className="admin-detail-grid">
                  {/* Client details block */}
                  <div className="admin-detail-section-card">
                    <h4 className="section-card-title">Datos del Cliente</h4>
                    <div className="section-card-body">
                      <div className="info-row">
                        <span className="info-label">Nombre Comercial:</span>
                        <span className="info-value font-semibold">{selectedPedido.clienteId?.nombre}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Código Cliente:</span>
                        <span className="info-value">{selectedPedido.clienteId?.codigoCliente}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Día de Reparto:</span>
                        <span className="info-value">{selectedPedido.clienteId?.diaReparto}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Dirección:</span>
                        <span className="info-value">{selectedPedido.clienteId?.direccion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Status & Observations */}
                  <div className="admin-detail-section-card">
                    <h4 className="section-card-title">Estado de Pedido</h4>
                    <div className="section-card-body">
                      <div className="info-row">
                        <span className="info-label">Estado Actual:</span>
                        <span className={`status-badge-inline ${getStatusClass(selectedPedido.estado)}`}>
                          {selectedPedido.estado}
                        </span>
                      </div>
                      
                      {selectedPedido.observaciones && (
                        <div className="obs-scroll-box">
                          <strong>Historial / Observaciones:</strong>
                          <p className="text-sm whitespace-pre-wrap">{selectedPedido.observaciones}</p>
                        </div>
                      )}

                      {/* State updates actions */}
                      <div className="status-progress-buttons">
                        <span className="progress-actions-label">Progresar pedido a:</span>
                        <div className="progress-actions-list">
                          {getNextStates(selectedPedido.estado).map(state => (
                            <button
                              key={state}
                              className={`btn-prog-state ${state === 'Cancelado' ? 'btn-prog-cancel' : 'btn-prog-next'}`}
                              onClick={() => handleStatusChangeRequest(state)}
                            >
                              {state}
                            </button>
                          ))}
                          {getNextStates(selectedPedido.estado).length === 0 && (
                            <span className="text-muted text-xs">Pedido finalizado o cancelado. Sin acciones.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products editing pane */}
                <div className="admin-products-list-card mt-6">
                  <div className="card-header-flex">
                    <h4 className="section-card-title">Productos Solicitados</h4>
                    {selectedPedido.estado !== 'Entregado' && selectedPedido.estado !== 'Cancelado' && (
                      <button 
                        className={`btn-edit-mode ${editingItems ? 'active' : ''}`}
                        onClick={() => {
                          if (editingItems) {
                            // Reset modified
                            const initialQty = {};
                            selectedDetails.forEach(item => {
                              initialQty[item.productoId._id] = item.cantidad;
                            });
                            setModifiedQty(initialQty);
                            setEditingItems(false);
                          } else {
                            setEditingItems(true);
                          }
                        }}
                      >
                        {editingItems ? 'Cancelar Edición' : 'Editar Cantidades'}
                      </button>
                    )}
                  </div>

                  <div className="detail-table-wrapper max-h-96">
                    <table className="detail-table">
                      <thead>
                        <tr>
                          <th>Imagen</th>
                          <th>Código</th>
                          <th>Producto</th>
                          <th>Marca</th>
                          <th>P. Unitario</th>
                          <th className="th-qty">Cantidad</th>
                          <th className="text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDetails.map((item) => {
                          const prod = item.productoId;
                          if (!prod) return null;
                          const currentVal = modifiedQty[prod._id] ?? item.cantidad;

                          return (
                            <tr key={item._id}>
                              <td>
                                <img 
                                  src={getProductImageUrl(prod.imagen)} 
                                  alt={prod.nombre} 
                                  className="table-item-img"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/50?text=Sin+Imagen';
                                  }}
                                />
                              </td>
                              <td className="table-item-code">{prod.codigo}</td>
                              <td>{prod.nombre}</td>
                              <td>{prod.marca}</td>
                              <td>U$S {item.precioUnitario.toFixed(2)}</td>
                              <td>
                                {editingItems ? (
                                  <div className="admin-qty-editor-cell">
                                    <input
                                      type="number"
                                      min="0"
                                      max={item.cantidad}
                                      value={currentVal}
                                      onChange={(e) => handleQtyEdit(prod._id, e.target.value, item.cantidad)}
                                      className="admin-table-qty-input"
                                    />
                                    {currentVal === 0 && (
                                      <span className="text-red text-xxs font-semibold" title="Se quitará del pedido">Quitar</span>
                                    )}
                                  </div>
                                ) : (
                                  <span>{item.cantidad} uds</span>
                                )}
                              </td>
                              <td className="text-right font-medium">
                                U$S {(item.precioUnitario * currentVal).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {editingItems && (
                    <div className="admin-mod-reason-panel">
                      <div className="form-group flex-1">
                        <label htmlFor="mod-reason">Motivo de la modificación (Requerido):</label>
                        <input
                          type="text"
                          id="mod-reason"
                          placeholder="Ej: Cliente solicitó reducir stock / Quitar productos agotados"
                          value={modificationReason}
                          onChange={(e) => setModificationReason(e.target.value)}
                        />
                      </div>
                      <button 
                        className="btn-save-modifications"
                        onClick={handleSaveItemModifications}
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="modal-footer">
              <button className="secondary-action-btn" onClick={() => setSelectedPedido(null)}>
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation State Transition Modal */}
      {showStatusModal && (
        <div className="modal-overlay z-index-top">
          <div className="confirmation-modal max-w-md">
            <div className="modal-icon-header text-blue">
              <Clock size={36} />
            </div>
            <h3 className="modal-confirm-title">Cambiar Estado Pedido</h3>
            <p className="modal-confirm-desc">
              ¿Confirmas pasar el pedido a estado <strong>{targetStatus}</strong>?
              {targetStatus === 'Entregado' && ' Esto impactará y actualizará automáticamente el stock del cliente.'}
            </p>

            <div className="form-group text-left px-6">
              <label htmlFor="status-reason" className="font-semibold text-xs mb-1 block">Motivo del Cambio de Estado (Requerido):</label>
              <textarea
                id="status-reason"
                rows="2"
                placeholder="Ej: Mercadería despachada / Firma de conformidad"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="modal-confirm-actions">
              <button className="btn-modal-cancel" onClick={() => setShowStatusModal(false)}>
                Cancelar
              </button>
              <button 
                className="btn-modal-confirm bg-blue" 
                onClick={handleConfirmStatusChange}
                disabled={!statusReason.trim()}
              >
                Confirmar Cambio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosAdmin;
