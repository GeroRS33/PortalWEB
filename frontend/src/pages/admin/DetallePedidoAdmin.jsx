import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { 
  ChevronLeft, Calendar, Info, Clock, AlertTriangle, FileText, 
  CheckCircle, CheckCircle2, Truck, User, Printer, RotateCcw, Edit2, Save, X, Check, Package, XCircle 
} from 'lucide-react';

const DetallePedidoAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(NotificationContext);
  
  const [pedido, setPedido] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Status transition modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [statusReason, setStatusReason] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Quantities modification state
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [modifiedQty, setModifiedQty] = useState({});
  const [qtyReason, setQtyReason] = useState('');

  const fetchPedidoDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/pedidos/${id}`);
      setPedido(res.data.pedido);
      setDetails(res.data.details);

      // Initialize modified quantities
      const initialQty = {};
      res.data.details.forEach(item => {
        initialQty[item._id] = item.cantidad;
      });
      setModifiedQty(initialQty);
    } catch (err) {
      console.error('Error fetching admin order detail:', err);
      setError('No se pudo cargar el detalle del pedido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidoDetail();
  }, [id]);

  // Status transition handler
  const handleStatusChangeRequest = async (targetStatus) => {
    if (targetStatus === 'Cancelado') {
      setPendingStatus(targetStatus);
      setStatusReason('');
      setShowStatusModal(true);
    } else {
      try {
        setLoading(true);
        await api.put(`/pedidos/${id}/estado`, {
          nuevoEstado: targetStatus,
          motivo: `Cambio de estado a ${targetStatus} realizado por la administración.`
        });
        showToast('Estado Actualizado', `El pedido ha sido cambiado a "${targetStatus}".`);
        fetchPedidoDetail();
      } catch (err) {
        console.error('Error updating order status:', err);
        showToast('Error', err.response?.data?.message || 'No se pudo cambiar el estado del pedido.');
        setLoading(false);
      }
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;
    try {
      setSubmittingStatus(true);
      await api.put(`/pedidos/${id}/estado`, {
        nuevoEstado: pendingStatus,
        motivo: statusReason
      });
      showToast('Estado Actualizado', `El pedido ha sido cambiado a "${pendingStatus}".`);
      setShowStatusModal(false);
      fetchPedidoDetail();
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Error', err.response?.data?.message || 'No se pudo actualizar el estado.');
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Save modified quantities
  const handleSaveQuantities = async () => {
    if (!qtyReason.trim()) {
      showToast('Motivo requerido', 'Debes ingresar un motivo para modificar las cantidades.');
      return;
    }

    try {
      setLoading(true);
      const itemsToUpdate = details.map(item => ({
        detailId: item._id,
        cantidad: modifiedQty[item._id] ?? item.cantidad
      }));

      await api.put(`/pedidos/${id}/productos`, {
        modificaciones: itemsToUpdate,
        motivo: qtyReason
      });

      showToast('Cantidades Actualizadas', 'Se han modificado los productos del pedido.');
      setIsEditingQty(false);
      setQtyReason('');
      fetchPedidoDetail();
    } catch (err) {
      console.error('Error modifying quantities:', err);
      showToast('Error', err.response?.data?.message || 'No se pudieron actualizar las cantidades.');
      setLoading(false);
    }
  };

  const getProductImageUrl = (filename) => {
    if (!filename) return 'https://via.placeholder.com/80?text=Sin+Imagen';
    return `http://localhost:5001/images/ImagenesCatalogo/${filename}`;
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

  const parseObservaciones = (obsText) => {
    if (!obsText) return { clientObs: 'Sin observaciones especiales para este pedido.', auditLogs: [] };
    const lines = obsText.split('\n');
    const clientLines = [];
    const auditLogs = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('[Modificación Admin]') || trimmed.startsWith('[Cambio Estado]')) {
        let type = 'Nota';
        let content = trimmed;
        if (trimmed.startsWith('[Modificación Admin]:')) {
          type = 'Modificación de Cantidades';
          content = trimmed.replace('[Modificación Admin]:', '').trim();
        } else if (trimmed.startsWith('[Cambio Estado]:')) {
          type = 'Cambio de Estado';
          content = trimmed.replace('[Cambio Estado]:', '').trim();
        }
        auditLogs.push({ type, text: content });
      } else {
        clientLines.push(trimmed);
      }
    });
    return {
      clientObs: clientLines.join('\n') || 'Sin observaciones especiales para este pedido.',
      auditLogs
    };
  };

  if (loading) {
    return (
      <div className="loader-container-full">
        <div className="loader"></div>
        <p>Cargando detalles de pedido para administración...</p>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="error-view">
        <div className="error-box">{error || 'Pedido no encontrado.'}</div>
        <Link to="/admin/pedidos" className="back-btn"><ChevronLeft size={16} /> Volver a pedidos</Link>
      </div>
    );
  }

  // Calculations
  const orderSubtotal = details.reduce((sum, item) => {
    const qty = isEditingQty ? (modifiedQty[item._id] ?? item.cantidad) : item.cantidad;
    return sum + item.precioUnitario * qty;
  }, 0);
  const orderIVA = orderSubtotal * 0.22;
  const orderTotal = orderSubtotal * 1.22;

  const { clientObs, auditLogs } = parseObservaciones(pedido.observaciones);
  const nextStates = getNextStates(pedido.estado);
  const isEditable = pedido.estado === 'Generado' || pedido.estado === 'Confirmado';

  const statesList = ['Generado', 'Confirmado', 'En preparación', 'Entregado'];
  const getTimelineStepStatus = (stateName) => {
    if (pedido.estado === 'Cancelado') {
      return stateName === 'Generado' ? 'completed' : 'pending';
    }
    const currentIndex = statesList.indexOf(pedido.estado);
    const stepIndex = statesList.indexOf(stateName);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepStyle = (state, status) => {
    const isCompleted = status === 'completed' || status === 'active';
    if (!isCompleted) {
      return {
        bubbleStyle: { backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#94a3b8' },
        titleStyle: { color: '#64748b', fontWeight: '600' }
      };
    }

    switch (state) {
      case 'Generado':
        return {
          bubbleStyle: { backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#ffffff', boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.2)' },
          titleStyle: { color: '#2563eb', fontWeight: '800' }
        };
      case 'Confirmado':
        return {
          bubbleStyle: { backgroundColor: '#4f46e5', borderColor: '#4f46e5', color: '#ffffff', boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.2)' },
          titleStyle: { color: '#4f46e5', fontWeight: '800' }
        };
      case 'En preparación':
        return {
          bubbleStyle: { backgroundColor: '#d97706', borderColor: '#d97706', color: '#ffffff', boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.2)' },
          titleStyle: { color: '#d97706', fontWeight: '800' }
        };
      case 'Entregado':
        return {
          bubbleStyle: { backgroundColor: '#059669', borderColor: '#059669', color: '#ffffff', boxShadow: '0 0 0 3px rgba(5, 150, 105, 0.2)' },
          titleStyle: { color: '#059669', fontWeight: '800' }
        };
      default:
        return {
          bubbleStyle: { backgroundColor: '#161A4E', borderColor: '#161A4E', color: '#ffffff' },
          titleStyle: { color: '#161A4E', fontWeight: '800' }
        };
    }
  };

  return (
    <div className="detalle-pedido-page-new admin-detail-page-container">
      {/* Top back navigation link */}
      <div className="back-navigation-row">
        <Link to="/admin/pedidos" className="back-link-purple">
          &larr; Volver a gestión de pedidos
        </Link>
      </div>

      {/* Main Header Row with Title, Badge, and Actions */}
      <div className="detail-header-block-new">
        <div className="header-left-new">
          <div className="title-row-new">
            <h2 className="detail-title-new">Detalle de pedido #{pedido._id.toString().slice(-6).toUpperCase()}</h2>
            <span className={`status-badge-inline ${getStatusClass(pedido.estado)}`}>
              {pedido.estado}
            </span>
          </div>
          <p className="detail-subtitle-new">
            Solicitado por <strong>{pedido.clienteId?.nombre}</strong> ({pedido.clienteId?.codigoCliente}) el {new Date(pedido.fechaCreacion).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' })} a las {new Date(pedido.fechaCreacion).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })} hs
          </p>
        </div>
        
        <div className="header-right-new">
          <button className="btn-print-order" onClick={() => window.print()}>
            <Printer size={16} />
            <span>Imprimir Remito</span>
          </button>
          
          {isEditable && !isEditingQty && (
            <button className="btn-secondary-action-admin" onClick={() => setIsEditingQty(true)}>
              <Edit2 size={16} />
              <span>Modificar Cantidades</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout Grid */}
      <div className="detail-split-layout-grid align-items-stretch">
        {/* Left Column: Horizontal Timeline FIRST, Products SECOND */}
        <div className="detail-main-content-column">
          {/* Card 1: Historial de Pedido (Top Card) */}
          <div className="detail-main-content-card mb-4">
            <h3 className="products-list-card-title">Historial del pedido</h3>
            
            <div className="horizontal-order-timeline-wrapper">
              <div className="horizontal-timeline-line"></div>
              
              <div className="horizontal-timeline-steps">
                {statesList.map((state) => {
                  const status = getTimelineStepStatus(state);
                  const stepIcon = state === 'Generado' ? <FileText size={14} /> :
                                   state === 'Confirmado' ? <CheckCircle2 size={14} /> :
                                   state === 'En preparación' ? <Package size={14} /> :
                                   <CheckCircle2 size={14} />;

                  const stepStyle = getStepStyle(state, status);

                  return (
                    <div key={state} className={`h-timeline-step ${status}`}>
                      <div className="h-timeline-bubble" style={stepStyle.bubbleStyle}>
                        {stepIcon}
                      </div>
                      <div className="h-timeline-text-block">
                        <span className="h-timeline-title" style={stepStyle.titleStyle}>{state}</span>
                        <span className="h-timeline-time">
                          {state === 'Generado' ? (
                            `${new Date(pedido.fechaCreacion).toLocaleDateString('es-UY')} - ${new Date(pedido.fechaCreacion).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })} hs`
                          ) : pedido.estado === state ? (
                            `${new Date(pedido.updatedAt).toLocaleDateString('es-UY')} - ${new Date(pedido.updatedAt).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })} hs`
                          ) : status === 'completed' ? (
                            'Completado'
                          ) : (
                            'Pendiente'
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {pedido.estado === 'Cancelado' && (
                  <div className="h-timeline-step canceled">
                    <div className="h-timeline-bubble" style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff', boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.2)' }}>
                      <XCircle size={14} />
                    </div>
                    <div className="h-timeline-text-block">
                      <span className="h-timeline-title" style={{ color: '#dc2626', fontWeight: '800' }}>Cancelado</span>
                      <span className="h-timeline-time text-red">
                        {new Date(pedido.updatedAt).toLocaleDateString('es-UY')} - {new Date(pedido.updatedAt).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })} hs
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Productos (Bottom Card) */}
          <div className="detail-main-content-card">
            <div className="flex-between-header">
              <h3 className="products-list-card-title mb-0">Productos en el pedido ({details.length})</h3>
              {isEditingQty && (
                <span className="badge-edit-mode">Modo Edición Activo</span>
              )}
            </div>
            
            <div className="detail-table-wrapper-new mt-4">
              <table className="detail-table-new">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Código</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-right">Precio unit.</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((item) => {
                    const currentQty = modifiedQty[item._id] ?? item.cantidad;
                    return (
                      <tr key={item._id}>
                        <td>
                          <div className="product-table-cell-new">
                            <img 
                              src={getProductImageUrl(item.productoId?.imagen)} 
                              alt={item.productoId?.nombre || 'Producto'} 
                              className="table-item-img-new"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80?text=Sin+Imagen';
                              }}
                            />
                            <div className="product-table-cell-details">
                              <span className="product-cell-name">{item.productoId?.nombre || 'Producto no disponible'}</span>
                              <span className="product-cell-brand">{item.productoId?.marca || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="table-item-code-new">{item.productoId?.codigo || 'N/A'}</td>
                        <td className="text-center font-semibold">
                          {isEditingQty ? (
                            <input
                              type="number"
                              min="0"
                              max={item.cantidad}
                              className="qty-edit-input-admin"
                              value={currentQty}
                              onChange={(e) => {
                                const val = Math.min(item.cantidad, Math.max(0, parseInt(e.target.value, 10) || 0));
                                setModifiedQty(prev => ({ ...prev, [item._id]: val }));
                              }}
                            />
                          ) : (
                            <span>{item.cantidad}</span>
                          )}
                        </td>
                        <td className="text-right">USD {item.precioUnitario.toFixed(2)}</td>
                        <td className="text-right font-semibold">USD {(item.precioUnitario * currentQty).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Edit quantities footer controls */}
            {isEditingQty && (
              <div className="qty-edit-controls-box">
                <div className="input-group">
                  <label className="input-label-sm">Motivo de la modificación:</label>
                  <input
                    type="text"
                    placeholder="Ej: Falta de stock en depósito..."
                    value={qtyReason}
                    onChange={(e) => setQtyReason(e.target.value)}
                    className="qty-reason-input"
                  />
                </div>
                <div className="flex-gap-2 justify-end mt-3">
                  <button className="btn-modal-cancel" onClick={() => setIsEditingQty(false)}>
                    Cancelar
                  </button>
                  <button className="btn-repeat-order" onClick={handleSaveQuantities}>
                    <Check size={16} />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions & Full Resumen del pedido Sidebar */}
        <div className="detail-sidebar-column flex-col-full">
          <div className="dashboard-card summary-full-sidebar-card">
            {/* Admin State Transition Actions */}
            {nextStates.length > 0 && (
              <div className="admin-actions-block mb-4 pb-4 border-b border-gray-200">
                <h3 className="sidebar-box-title">Acciones de Pedido</h3>
                <p className="text-xs text-muted mb-3">Cambia el estado de este pedido:</p>
                <div className="admin-status-buttons-column">
                  {nextStates.map(st => (
                    <button
                      key={st}
                      className={`btn-admin-state-action ${st === 'Cancelado' ? 'cancel' : 'confirm'}`}
                      onClick={() => handleStatusChangeRequest(st)}
                    >
                      <span>Pasar a "{st}"</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <h3 className="sidebar-box-title">Resumen del pedido</h3>
            
            <div className="summary-price-row">
              <span className="price-row-label">Subtotal</span>
              <span className="price-row-value">USD {orderSubtotal.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="summary-price-row border-bottom-dotted">
              <span className="price-row-label">IVA (22%)</span>
              <span className="price-row-value">USD {orderIVA.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="summary-price-row-total">
              <span className="total-label">Total</span>
              <span className="total-value">USD {orderTotal.toLocaleString('es-UY', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="sidebar-divider-line my-4"></div>

            <h3 className="sidebar-box-title">Observaciones</h3>
            <div className="client-obs-section">
              <p className="sidebar-obs-text">{clientObs}</p>
            </div>

            {auditLogs.length > 0 && (
              <div className="audit-logs-section mt-4">
                <h4 className="audit-logs-title">Historial de Auditoría</h4>
                <div className="audit-logs-list">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="audit-log-item">
                      <span className="audit-log-type">{log.type}</span>
                      <span className="audit-log-text">{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Printable Voucher */}
      <div className="printable-order-voucher">
        <div className="print-voucher-header">
          <div className="print-company-info">
            <h1 className="print-company-name">WEB LTDA</h1>
            <p className="print-company-sub">Distribución y Comercialización Mayorista</p>
            <p className="print-company-detail">RUT: 219999990018 | Tel: (598) 2400 0000</p>
            <p className="print-company-detail">Montevideo, Uruguay</p>
          </div>
          <div className="print-doc-info">
            <h2 className="print-doc-title">COMPROBANTE DE PEDIDO / REMITO</h2>
            <div className="print-doc-badge">N° #{pedido._id.toString().slice(-6).toUpperCase()}</div>
            <p className="print-doc-meta"><strong>Fecha de emisión:</strong> {new Date(pedido.fechaCreacion).toLocaleDateString('es-UY')} {new Date(pedido.fechaCreacion).toLocaleTimeString('es-UY')}</p>
            <p className="print-doc-meta"><strong>Estado:</strong> {pedido.estado}</p>
          </div>
        </div>

        <div className="print-voucher-grid">
          <div className="print-voucher-box">
            <h3 className="print-box-title">DATOS DEL CLIENTE</h3>
            <p><strong>Razón Social:</strong> {pedido.clienteId?.nombre}</p>
            <p><strong>Código Cliente:</strong> {pedido.clienteId?.codigoCliente}</p>
            <p><strong>Dirección de Entrega:</strong> {pedido.clienteId?.direccion}</p>
            <p><strong>Día de Reparto:</strong> {pedido.clienteId?.diaReparto}</p>
          </div>
          <div className="print-voucher-box">
            <h3 className="print-box-title">CONDICIONES DE VENTA</h3>
            <p><strong>Forma de Pago:</strong> Cuenta corriente (30 días)</p>
            <p><strong>Moneda:</strong> Dólares estadounidenses (USD)</p>
            <p><strong>Remito N°:</strong> {pedido.estado === 'Entregado' ? `R-000${pedido._id.toString().slice(-4).toUpperCase()}` : 'Pendiente de entrega'}</p>
          </div>
        </div>

        <table className="print-table">
          <thead>
            <tr>
              <th>CÓDIGO</th>
              <th>DESCRIPCIÓN DE PRODUCTO</th>
              <th>MARCA</th>
              <th className="text-center">CANT.</th>
              <th className="text-right">P. UNIT (USD)</th>
              <th className="text-right">SUBTOTAL (USD)</th>
            </tr>
          </thead>
          <tbody>
            {details.map((item) => (
              <tr key={item._id}>
                <td className="font-mono">{item.productoId?.codigo || 'N/A'}</td>
                <td><strong>{item.productoId?.nombre || 'Producto'}</strong></td>
                <td>{item.productoId?.marca || 'N/A'}</td>
                <td className="text-center">{item.cantidad}</td>
                <td className="text-right">{item.precioUnitario.toFixed(2)}</td>
                <td className="text-right">{(item.precioUnitario * item.cantidad).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-voucher-bottom">
          <div className="print-obs-box">
            <h4>OBSERVACIONES:</h4>
            <p>{clientObs}</p>
          </div>
          <div className="print-totals-box">
            <div className="print-total-row"><span>SUBTOTAL:</span> <span>USD {orderSubtotal.toFixed(2)}</span></div>
            <div className="print-total-row"><span>IVA (22%):</span> <span>USD {orderIVA.toFixed(2)}</span></div>
            <div className="print-total-row total-highlight"><span>TOTAL GENERAL:</span> <span>USD {orderTotal.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="print-signatures-row">
          <div className="signature-box">
            <div className="signature-line"></div>
            <p>Firma y Aclaración Cliente</p>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <p>Despachado / Reparto WEB LTDA</p>
          </div>
        </div>

        <div className="print-voucher-footer">
          Documento emitido electrónicamente por Portal WEB LTDA — {new Date().toLocaleDateString('es-UY')}
        </div>
      </div>

      {/* Confirmation Modal for Status Reason (e.g. Cancellation) */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3 className="modal-confirm-title">Confirmar cambio de estado a "{pendingStatus}"</h3>
            <p className="modal-confirm-desc">Ingresa el motivo del cambio de estado para registrar en la auditoría:</p>
            <textarea
              className="status-reason-textarea"
              placeholder="Escribe el motivo del cambio..."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              rows="3"
            />
            <div className="modal-confirm-actions mt-4">
              <button className="btn-modal-cancel" onClick={() => setShowStatusModal(false)} disabled={submittingStatus}>
                Cancelar
              </button>
              <button className="btn-modal-confirm bg-blue" onClick={handleConfirmStatusChange} disabled={submittingStatus || !statusReason.trim()}>
                {submittingStatus ? 'Guardando...' : 'Confirmar Estado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallePedidoAdmin;
