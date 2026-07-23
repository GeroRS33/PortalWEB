import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { Search, UserPlus, Edit2, Eye, Calendar, MapPin, User, FileText, ClipboardList, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';

const ClientesAdmin = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(NotificationContext);
  
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modals visibility state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Forms state
  const [formData, setFormData] = useState({
    id: '',
    codigoCliente: '',
    nombre: '',
    direccion: '',
    diaReparto: 'Lunes',
    contrasena: ''
  });

  // Client Details state
  const [clientDetail, setClientDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/clientes?search=${encodeURIComponent(search)}`);
      setClientes(res.data);
    } catch (err) {
      console.error('Error fetching admin clients:', err);
      setError('No se pudo cargar la lista de clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchClientes();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpenDetail = async (client) => {
    try {
      setLoadingDetail(true);
      setShowDetailModal(true);
      const res = await api.get(`/clientes/${client._id}`);
      setClientDetail(res.data);
    } catch (err) {
      console.error('Error fetching client details:', err);
      showToast('Error', 'No se pudo obtener el detalle del cliente');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      id: '',
      codigoCliente: '',
      nombre: '',
      direccion: '',
      diaReparto: 'Lunes',
      contrasena: ''
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const { codigoCliente, nombre, direccion, diaReparto, contrasena } = formData;

    if (!codigoCliente.trim() || !nombre.trim() || !direccion.trim() || !diaReparto || !contrasena) {
      showToast('Advertencia', 'Todos los campos son obligatorios');
      return;
    }

    try {
      await api.post('/clientes', {
        codigoCliente: codigoCliente.trim(),
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        diaReparto,
        contrasena
      });

      showToast('Cliente Creado', 'El nuevo cliente se ha registrado con éxito.');
      setShowCreateModal(false);
      fetchClientes();
    } catch (err) {
      console.error('Error creating client:', err);
      showToast('Error', err.response?.data?.message || 'No se pudo registrar el cliente');
    }
  };

  const handleOpenEdit = (client) => {
    setFormData({
      id: client._id,
      codigoCliente: client.codigoCliente,
      nombre: client.nombre,
      direccion: client.direccion,
      diaReparto: client.diaReparto,
      contrasena: '' // Leave empty by default
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const { id, nombre, direccion, diaReparto, contrasena } = formData;

    if (!nombre.trim() || !direccion.trim() || !diaReparto) {
      showToast('Advertencia', 'Los campos Nombre, Dirección y Reparto son obligatorios');
      return;
    }

    try {
      await api.put(`/clientes/${id}`, {
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        diaReparto,
        contrasena: contrasena.trim() !== '' ? contrasena : undefined
      });

      showToast('Cliente Actualizado', 'Los datos del cliente se actualizaron con éxito.');
      setShowEditModal(false);
      fetchClientes();
      
      // If details modal is open with this same client, reload details
      if (showDetailModal && clientDetail?.cliente._id === id) {
        handleOpenDetail({ _id: id });
      }
    } catch (err) {
      console.error('Error updating client:', err);
      showToast('Error', err.response?.data?.message || 'No se pudo actualizar el cliente');
    }
  };

  const getProductImageUrl = (filename) => {
    if (!filename) return 'https://via.placeholder.com/40?text=Sin+Imagen';
    return `http://localhost:5001/images/ImagenesCatalogo/${filename}`;
  };

  return (
    <div className="admin-clientes-page">
      <div className="page-header-container">
        <div>
          <h1 className="page-title">Gestión de Clientes</h1>
          <p className="page-subtitle">Visualiza, registra y modifica las cuentas de comercios asociados.</p>
        </div>
        
        <button className="primary-action-btn" onClick={handleOpenCreate}>
          <UserPlus size={16} />
          <span>Crear Cliente</span>
        </button>
      </div>

      <div className="stock-actions-bar">
        <div className="search-bar-container max-w-md">
          <Search size={18} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading && clientes.length === 0 ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Cargando lista de clientes...</p>
        </div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : clientes.length === 0 ? (
        <div className="empty-catalog-state">
          <p>No se encontraron clientes registrados.</p>
        </div>
      ) : (
        <div className="stock-table-card">
          <div className="detail-table-wrapper">
            <table className="detail-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre Comercial</th>
                  <th>Dirección</th>
                  <th>Día de Reparto</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c._id} className="row-hover-pointer" onClick={() => handleOpenDetail(c)}>
                    <td className="table-item-code">{c.codigoCliente}</td>
                    <td className="font-semibold text-primary">{c.nombre}</td>
                    <td>{c.direccion}</td>
                    <td>
                      <span className="badge-delivery-day">{c.diaReparto}</span>
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="admin-actions-cell">
                        <button 
                          className="btn-action-view" 
                          onClick={() => handleOpenDetail(c)}
                        >
                          <Eye size={13} />
                          <span>Ver</span>
                        </button>
                        <button 
                          className="btn-action-edit"
                          onClick={() => handleOpenEdit(c)}
                        >
                          <Edit2 size={13} />
                          <span>Editar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="modal-overlay">
          <div className="admin-client-detail-modal">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Ficha del Cliente</h3>
                <p className="modal-subtitle">Historial de compras y stock actual</p>
              </div>
              <button className="modal-close-x" onClick={() => setShowDetailModal(false)}>&times;</button>
            </div>

            {loadingDetail || !clientDetail ? (
              <div className="loader-container py-12"><div className="loader"></div></div>
            ) : (
              <div className="modal-body-scrollable">
                <div className="admin-detail-grid">
                  {/* General Profile info */}
                  <div className="admin-detail-section-card">
                    <h4 className="section-card-title">Datos Personales</h4>
                    <div className="section-card-body">
                      <div className="info-row">
                        <span className="info-label">Nombre / Razón:</span>
                        <span className="info-value font-semibold">{clientDetail.cliente.nombre}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Código:</span>
                        <span className="info-value">{clientDetail.cliente.codigoCliente}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Dirección:</span>
                        <span className="info-value">{clientDetail.cliente.direccion}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Día de Reparto:</span>
                        <span className="info-value">{clientDetail.cliente.diaReparto}</span>
                      </div>
                      
                      <button 
                        className="btn-action-edit mt-4 w-full justify-center"
                        onClick={() => {
                          setShowDetailModal(false);
                          handleOpenEdit(clientDetail.cliente);
                        }}
                      >
                        <Edit2 size={14} />
                        <span>Modificar Datos</span>
                      </button>
                    </div>
                  </div>

                  {/* Stock records table */}
                  <div className="admin-detail-section-card">
                    <div className="flex-between-header border-b border-gray-100 pb-2 mb-3">
                      <h4 className="section-card-title mb-0">Stock Registrado</h4>
                      {clientDetail.stock.length > 0 && (
                        <button
                          className="btn-action-view text-xs"
                          onClick={() => {
                            setShowDetailModal(false);
                            navigate(`/admin/clientes/${clientDetail.cliente._id}/stock`);
                          }}
                        >
                          <span>Ver stock completo</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>

                    <div className="section-card-body max-h-72 overflow-y-auto">
                      {clientDetail.stock.length === 0 ? (
                        <p className="text-muted text-xs p-4 text-center">El cliente no posee stock registrado en el sistema.</p>
                      ) : (
                        <table className="admin-mini-table">
                          <thead>
                            <tr>
                              <th>Cod</th>
                              <th>Nombre</th>
                              <th>Cantidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clientDetail.stock.map(item => (
                              <tr key={item._id}>
                                <td className="text-xxs">{item.productoId?.codigo}</td>
                                <td className="text-xs truncate max-w-xs">{item.productoId?.nombre}</td>
                                <td className="font-semibold">{item.cantidad} uds</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>

                {/* Last orders list */}
                <div className="admin-products-list-card mt-6">
                  <h4 className="section-card-title">Últimos Pedidos Realizados</h4>
                  <div className="detail-table-wrapper max-h-72">
                    {clientDetail.pedidos.length === 0 ? (
                      <p className="text-muted text-xs p-4 text-center">El cliente no ha realizado pedidos aún.</p>
                    ) : (
                      <table className="detail-table">
                        <thead>
                          <tr>
                            <th>Nro Pedido</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Observaciones</th>
                            <th className="text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientDetail.pedidos.map(p => (
                            <tr key={p._id}>
                              <td className="font-semibold text-primary">#{p._id.toString().slice(-6).toUpperCase()}</td>
                              <td>{new Date(p.fechaCreacion).toLocaleDateString('es-UY')}</td>
                              <td>
                                <span className={`badge-delivery-day`}>
                                  {p.estado}
                                </span>
                              </td>
                              <td className="obs-table-cell-truncated" title={p.observaciones}>{p.observaciones || '-'}</td>
                              <td className="text-right">
                                <button
                                  className="btn-action-view text-xs"
                                  onClick={() => {
                                    setShowDetailModal(false);
                                    navigate(`/admin/pedidos/${p._id}`);
                                  }}
                                >
                                  <Eye size={13} />
                                  <span>Ver detalle</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="modal-footer">
              <button className="secondary-action-btn" onClick={() => setShowDetailModal(false)}>
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <form className="admin-form-modal" onSubmit={handleCreateSubmit}>
            <div className="modal-header">
              <h3 className="modal-title">Registrar Nuevo Cliente</h3>
              <button type="button" className="modal-close-x" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="create-codigo">Código del Cliente (Único, no editable después):</label>
                <input
                  type="text"
                  id="create-codigo"
                  placeholder="Ej: cli004"
                  value={formData.codigoCliente}
                  onChange={(e) => setFormData({ ...formData, codigoCliente: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="create-nombre">Nombre Comercial / Empresa:</label>
                <input
                  type="text"
                  id="create-nombre"
                  placeholder="Ej: Ferretería Paso de la Arena"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="create-direccion">Dirección Física de Entrega:</label>
                <input
                  type="text"
                  id="create-direccion"
                  placeholder="Ej: Av. Uruguay 1450"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="create-reparto">Día de Reparto:</label>
                <select
                  id="create-reparto"
                  value={formData.diaReparto}
                  onChange={(e) => setFormData({ ...formData, diaReparto: e.target.value })}
                  required
                >
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                  <option value="Sábado">Sábado</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="create-password">Contraseña Inicial:</label>
                <input
                  type="password"
                  id="create-password"
                  placeholder="Ej: password123"
                  value={formData.contrasena}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-action-btn" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="confirm-order-btn m-0 w-auto">
                Registrar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <form className="admin-form-modal" onSubmit={handleEditSubmit}>
            <div className="modal-header">
              <h3 className="modal-title">Modificar Datos del Cliente</h3>
              <button type="button" className="modal-close-x" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Código del Cliente (No modificable):</label>
                <input
                  type="text"
                  value={formData.codigoCliente}
                  disabled
                  className="bg-disabled"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-nombre">Nombre Comercial / Empresa:</label>
                <input
                  type="text"
                  id="edit-nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-direccion">Dirección Física de Entrega:</label>
                <input
                  type="text"
                  id="edit-direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-reparto">Día de Reparto:</label>
                <select
                  id="edit-reparto"
                  value={formData.diaReparto}
                  onChange={(e) => setFormData({ ...formData, diaReparto: e.target.value })}
                  required
                >
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                  <option value="Sábado">Sábado</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-password">Nueva Contraseña (Dejar en blanco para conservar actual):</label>
                <input
                  type="password"
                  id="edit-password"
                  placeholder="Ingrese nueva contraseña si desea cambiarla..."
                  value={formData.contrasena}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-action-btn" onClick={() => setShowEditModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="confirm-order-btn m-0 w-auto">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClientesAdmin;
