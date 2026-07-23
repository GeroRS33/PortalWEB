import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { 
  Layers, Search, Save, Check, RefreshCw, AlertTriangle, 
  Calendar, ShoppingBag, Edit2, Info, ArrowRight, Filter 
} from 'lucide-react';

const MiStock = () => {
  const { showToast } = useContext(NotificationContext);
  
  const [stock, setStock] = useState([]);
  const [lastDeliveredOrder, setLastDeliveredOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Todos'); // 'Todos' | 'Bien' | 'Bajo' | 'Crítico' | 'Sin stock' | 'Afectados'
  
  // Track quantities in editing state
  const [editingQty, setEditingQty] = useState({});
  const [activeEditId, setActiveEditId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [savingAll, setSavingAll] = useState(false);

  const fetchStockAndOrders = async () => {
    try {
      setLoading(true);
      const [stockRes, ordersRes] = await Promise.all([
        api.get('/stock'),
        api.get('/pedidos')
      ]);
      
      setStock(stockRes.data);
      
      // Find latest delivered order
      const delivered = ordersRes.data.filter(p => p.estado === 'Entregado');
      if (delivered.length > 0) {
        setLastDeliveredOrder(delivered[0]);
      } else if (ordersRes.data.length > 0) {
        setLastDeliveredOrder(ordersRes.data[0]);
      }
      
      // Initialize edit state
      const editState = {};
      stockRes.data.forEach(item => {
        editState[item.productoId._id] = item.cantidad;
      });
      setEditingQty(editState);
    } catch (err) {
      console.error('Error fetching stock page data:', err);
      setError('No se pudo cargar la información de tu stock.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockAndOrders();
  }, []);

  const handleQtyChange = (productId, val) => {
    const qty = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setEditingQty(prev => ({
      ...prev,
      [productId]: qty
    }));
  };

  const handleSaveStock = async (productId) => {
    const qty = editingQty[productId];
    if (qty === '') return;

    try {
      setSavingId(productId);
      const res = await api.put('/stock', {
        productoId: productId,
        cantidad: qty
      });
      
      showToast('Stock Actualizado', 'La cantidad del producto se ha guardado.');
      
      setStock(prev => prev.map(item => 
        item.productoId._id === productId 
          ? { ...item, cantidad: res.data.cantidad, ultimaActualizacion: res.data.ultimaActualizacion }
          : item
      ));
      setActiveEditId(null);
    } catch (err) {
      console.error('Error saving stock:', err);
      showToast('Error', err.response?.data?.message || 'No se pudo actualizar el stock');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveAllStock = async () => {
    try {
      setSavingAll(true);
      const dirtyItems = stock.filter(item => {
        const currentQty = editingQty[item.productoId._id];
        return currentQty !== undefined && currentQty !== item.cantidad && currentQty !== '';
      });

      if (dirtyItems.length === 0) {
        showToast('Info', 'No hay cambios de stock pendientes por guardar.');
        return;
      }

      await Promise.all(dirtyItems.map(item => 
        api.put('/stock', {
          productoId: item.productoId._id,
          cantidad: editingQty[item.productoId._id]
        })
      ));

      showToast('Stock Actualizado', 'Se han actualizado todas las cantidades modificadas.');
      fetchStockAndOrders();
    } catch (err) {
      console.error('Error saving all stock:', err);
      showToast('Error', 'Ocurrió un error al actualizar el stock masivo.');
    } finally {
      setSavingAll(false);
    }
  };

  // Status calculation logic
  const getStockStatus = (cantidad, stockCritico) => {
    if (cantidad === 0) {
      return { text: 'Sin stock', key: 'Sin stock', badgeClass: 'badge-stock-none' };
    }
    if (cantidad <= stockCritico / 2) {
      return { text: 'Crítico', key: 'Crítico', badgeClass: 'badge-stock-critical' };
    }
    if (cantidad <= stockCritico) {
      return { text: 'Bajo', key: 'Bajo', badgeClass: 'badge-stock-low' };
    }
    return { text: 'Bien', key: 'Bien', badgeClass: 'badge-stock-good' };
  };

  const getProductImageUrl = (filename) => {
    if (!filename) return 'https://via.placeholder.com/60?text=Sin+Imagen';
    return `http://localhost:5001/images/ImagenesCatalogo/${filename}`;
  };

  // Counts for breakdown
  const bienCount = stock.filter(i => i.cantidad > i.productoId.stockCritico).length;
  const bajoCount = stock.filter(i => i.cantidad > 0 && i.cantidad <= i.productoId.stockCritico && i.cantidad > i.productoId.stockCritico / 2).length;
  const criticoCount = stock.filter(i => i.cantidad > 0 && i.cantidad <= i.productoId.stockCritico / 2).length;
  const sinStockCount = stock.filter(i => i.cantidad === 0).length;
  const totalCount = stock.length;
  const affectedCount = bajoCount + criticoCount + sinStockCount;

  // Extract unique categories (brands)
  const categoriesList = ['Todos', ...new Set(stock.map(i => i.productoId?.marca).filter(Boolean))];

  // Latest update date
  const latestUpdateDate = stock.length > 0 
    ? new Date(Math.max(...stock.map(i => new Date(i.ultimaActualizacion))))
    : null;

  // Filtered Stock List
  const filteredStock = stock.filter(item => {
    const prod = item.productoId;
    if (!prod) return false;
    
    // Search text match
    const term = search.toLowerCase();
    const matchesSearch = (
      prod.nombre.toLowerCase().includes(term) ||
      prod.codigo.toLowerCase().includes(term) ||
      prod.marca.toLowerCase().includes(term)
    );
    if (!matchesSearch) return false;

    // Category match
    if (selectedCategory !== 'Todos' && prod.marca !== selectedCategory) {
      return false;
    }

    // Status filter match
    const statusObj = getStockStatus(item.cantidad, prod.stockCritico);
    if (selectedStatusFilter === 'Afectados') {
      if (statusObj.key === 'Bien') return false;
    } else if (selectedStatusFilter !== 'Todos') {
      if (statusObj.key !== selectedStatusFilter) return false;
    }

    return true;
  });

  const hasDirtyFields = stock.some(item => {
    const currentQty = editingQty[item.productoId._id];
    return currentQty !== undefined && currentQty !== item.cantidad;
  });

  return (
    <div className="mi-stock-page-v2">
      {/* Top Header Row with Title and Metadata Info Cards */}
      <div className="stock-header-main-row">
        <div className="stock-header-title-block">
          <h1 className="page-title">Mi stock</h1>
          <p className="page-subtitle">Acá podés ver el stock actual de tus productos.</p>
        </div>

        <div className="stock-header-cards-group">
          {/* Header Card 1: Última actualización */}
          <div className="stock-header-meta-card">
            <div className="meta-card-icon-wrapper bg-light-purple">
              <Calendar size={18} />
            </div>
            <div className="meta-card-text">
              <span className="meta-card-label">Última actualización</span>
              <span className="meta-card-value">
                {latestUpdateDate ? latestUpdateDate.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
              </span>
              <span className="meta-card-subtext">Actualizado por vos</span>
            </div>
          </div>

          {/* Header Card 2: Último pedido recibido */}
          <div className="stock-header-meta-card">
            <div className="meta-card-icon-wrapper bg-light-blue">
              <ShoppingBag size={18} />
            </div>
            <div className="meta-card-text">
              <span className="meta-card-label">Último pedido recibido</span>
              <span className="meta-card-value">
                {lastDeliveredOrder ? new Date(lastDeliveredOrder.fechaCreacion).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Sin registro'}
              </span>
              <span className="meta-card-subtext">
                {lastDeliveredOrder ? `Pedido #${lastDeliveredOrder._id.toString().slice(-6).toUpperCase()}` : 'Sin entregas'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Page Layout Grid: Left List Controls & Table vs Right Sidebar Widgets */}
      <div className="stock-layout-split-grid">
        {/* Left Section: Controls + Table */}
        <div className="stock-main-column">
          {/* Controls Bar: Search & Category Filter */}
          <div className="stock-controls-card">
            <div className="stock-search-filter-row">
              <div className="stock-search-input-wrapper">
                <Search size={18} className="search-icon-inside" />
                <input
                  type="text"
                  placeholder="Buscar por código o nombre de producto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="stock-search-input"
                />
              </div>

              <div className="stock-category-dropdown-wrapper">
                <Filter size={16} className="text-muted mr-1" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select-dropdown"
                >
                  <option value="Todos">Categoría: Todas</option>
                  {categoriesList.filter(c => c !== 'Todos').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Pills / Filter Tabs */}
            <div className="category-pills-scroll-row">
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Main Products Table Card */}
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <p>Cargando información de stock...</p>
            </div>
          ) : error ? (
            <div className="error-box">{error}</div>
          ) : stock.length === 0 ? (
            <div className="empty-history-state">
              <Layers size={48} className="text-muted" />
              <h3>No posees stock registrado</h3>
              <p>El stock se genera automáticamente cuando se te entrega tu primer pedido.</p>
              <Link to="/nuevo-pedido" className="btn-link-action">Realizar mi primer Pedido</Link>
            </div>
          ) : filteredStock.length === 0 ? (
            <div className="no-results-card">
              <p>No se encontraron productos en stock con los filtros seleccionados.</p>
              <button className="btn-link-simple mt-2" onClick={() => { setSearch(''); setSelectedCategory('Todos'); setSelectedStatusFilter('Todos'); }}>
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="stock-table-card-v2">
              <div className="table-responsive-wrapper">
                <table className="stock-table-v2">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Código</th>
                      <th>Stock actual</th>
                      <th>Estado</th>
                      <th className="text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.map((item) => {
                      const prod = item.productoId;
                      const currentQty = editingQty[prod._id] ?? item.cantidad;
                      const isEditingThis = activeEditId === prod._id;
                      const isDirty = currentQty !== item.cantidad;
                      const status = getStockStatus(item.cantidad, prod.stockCritico);

                      return (
                        <tr key={item._id}>
                          <td>
                            <div className="stock-product-cell">
                              <img 
                                src={getProductImageUrl(prod.imagen)} 
                                alt={prod.nombre} 
                                className="stock-product-thumbnail"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/60?text=Sin+Imagen';
                                }}
                              />
                              <div className="stock-product-info">
                                <span className="stock-product-name">{prod.nombre}</span>
                                <span className="stock-product-brand">{prod.marca}</span>
                              </div>
                            </div>
                          </td>
                          <td className="stock-code-cell">{prod.codigo}</td>
                          <td>
                            <div className="stock-qty-display-cell">
                              {isEditingThis ? (
                                <input
                                  type="number"
                                  min="0"
                                  className="stock-qty-edit-input"
                                  value={currentQty}
                                  onChange={(e) => handleQtyChange(prod._id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveStock(prod._id);
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <span className="stock-qty-text font-bold">
                                  {currentQty} <small className="text-muted font-normal">unidades</small>
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`stock-status-pill ${status.badgeClass}`}>
                              {status.text}
                            </span>
                          </td>
                          <td className="text-right">
                            {isEditingThis || isDirty ? (
                              <button
                                className={`stock-action-icon-btn save-active ${isDirty ? 'dirty' : ''}`}
                                onClick={() => handleSaveStock(prod._id)}
                                disabled={savingId === prod._id || currentQty === ''}
                                title="Guardar cambios"
                              >
                                {savingId === prod._id ? (
                                  <div className="spinner-sm"></div>
                                ) : (
                                  <Check size={16} />
                                )}
                              </button>
                            ) : (
                              <button
                                className="stock-action-icon-btn"
                                onClick={() => setActiveEditId(prod._id)}
                                title="Modificar cantidad"
                              >
                                <Edit2 size={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Sidebar Widgets */}
        <div className="stock-sidebar-column">
          {/* Card 1: Stock Alert Banner (Orange / Yellow) */}
          {affectedCount > 0 && (
            <div className="stock-warning-sidebar-card">
              <div className="warning-card-header">
                <AlertTriangle size={24} className="warning-icon-yellow" />
                <div>
                  <h4 className="warning-card-title">{affectedCount} productos con stock bajo</h4>
                  <p className="warning-card-desc">Revisá los productos que necesitan reposición.</p>
                </div>
              </div>
              <button 
                className="warning-card-action-link"
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Afectados' ? 'Todos' : 'Afectados')}
              >
                <span>{selectedStatusFilter === 'Afectados' ? 'Ver todos los productos' : 'Ver productos con stock bajo'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Card 2: Resumen de stock */}
          <div className="sidebar-widget-card">
            <h3 className="widget-card-title">Resumen de stock</h3>
            
            <div className="stock-summary-donut-wrapper">
              <div className="stock-summary-breakdown-list">
                <div 
                  className={`summary-breakdown-row ${selectedStatusFilter === 'Bien' ? 'active-filter' : ''}`}
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Bien' ? 'Todos' : 'Bien')}
                >
                  <div className="breakdown-label">
                    <span className="dot-indicator dot-green"></span>
                    <span>Bien</span>
                  </div>
                  <span className="breakdown-count font-bold">{bienCount}</span>
                </div>

                <div 
                  className={`summary-breakdown-row ${selectedStatusFilter === 'Bajo' ? 'active-filter' : ''}`}
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Bajo' ? 'Todos' : 'Bajo')}
                >
                  <div className="breakdown-label">
                    <span className="dot-indicator dot-yellow"></span>
                    <span>Bajo</span>
                  </div>
                  <span className="breakdown-count font-bold">{bajoCount}</span>
                </div>

                <div 
                  className={`summary-breakdown-row ${selectedStatusFilter === 'Crítico' ? 'active-filter' : ''}`}
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Crítico' ? 'Todos' : 'Crítico')}
                >
                  <div className="breakdown-label">
                    <span className="dot-indicator dot-red"></span>
                    <span>Crítico</span>
                  </div>
                  <span className="breakdown-count font-bold">{criticoCount}</span>
                </div>

                <div 
                  className={`summary-breakdown-row ${selectedStatusFilter === 'Sin stock' ? 'active-filter' : ''}`}
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Sin stock' ? 'Todos' : 'Sin stock')}
                >
                  <div className="breakdown-label">
                    <span className="dot-indicator dot-grey"></span>
                    <span>Sin stock</span>
                  </div>
                  <span className="breakdown-count font-bold">{sinStockCount}</span>
                </div>
              </div>
            </div>

            <div className="stock-total-divider-row">
              <span className="total-label-text">Total de productos</span>
              <span className="total-value-text">{totalCount}</span>
            </div>
          </div>

          {/* Card 3: ¿Cómo funciona mi stock? */}
          <div className="sidebar-widget-card help-info-widget">
            <div className="help-widget-header">
              <div className="help-icon-circle">
                <Info size={18} />
              </div>
              <div className="help-widget-text">
                <h4 className="help-widget-title">¿Cómo funciona mi stock?</h4>
                <p className="help-widget-desc">
                  Podés modificar manualmente las cantidades. Cuando recibimos un pedido, el stock se actualiza automáticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Actualizar stock (Bulk save button) */}
          <div className="sidebar-widget-card bulk-update-widget">
            <h4 className="bulk-widget-title">Actualizar stock</h4>
            <p className="bulk-widget-desc">Actualizá tus cantidades de forma rápida.</p>
            <button 
              className={`btn-bulk-update-stock ${hasDirtyFields ? 'highlight' : ''}`}
              onClick={handleSaveAllStock}
              disabled={savingAll}
            >
              {savingAll ? (
                <div className="spinner-sm"></div>
              ) : (
                <>
                  <Edit2 size={16} />
                  <span>Actualizar todo el stock</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiStock;
