import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft, Search, Layers, Calendar, User, MapPin } from 'lucide-react';

const StockClienteAdmin = () => {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchClientStockData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/clientes/${id}/detalle`);
      setCliente(res.data.cliente);
      setStock(res.data.stock);
    } catch (err) {
      console.error('Error fetching client stock data:', err);
      setError('No se pudo cargar la información de stock del cliente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientStockData();
  }, [id]);

  const getStockStatus = (cantidad, stockCritico) => {
    if (cantidad === 0) {
      return { text: 'Sin stock', badgeClass: 'badge-stock-none' };
    }
    if (cantidad <= stockCritico / 2) {
      return { text: 'Crítico', badgeClass: 'badge-stock-critical' };
    }
    if (cantidad <= stockCritico) {
      return { text: 'Bajo', badgeClass: 'badge-stock-low' };
    }
    return { text: 'Bien', badgeClass: 'badge-stock-good' };
  };

  const getProductImageUrl = (filename) => {
    if (!filename) return 'https://via.placeholder.com/60?text=Sin+Imagen';
    return `http://localhost:5001/images/ImagenesCatalogo/${filename}`;
  };

  const filteredStock = stock.filter(item => {
    const prod = item.productoId;
    if (!prod) return false;
    const term = search.toLowerCase();
    return (
      prod.nombre.toLowerCase().includes(term) ||
      prod.codigo.toLowerCase().includes(term) ||
      prod.marca.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="loader-container-full">
        <div className="loader"></div>
        <p>Cargando inventario del cliente...</p>
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="error-view">
        <div className="error-box">{error || 'Cliente no encontrado.'}</div>
        <Link to="/admin/clientes" className="back-btn"><ChevronLeft size={16} /> Volver a clientes</Link>
      </div>
    );
  }

  return (
    <div className="stock-cliente-admin-page">
      <div className="back-navigation-row">
        <Link to="/admin/clientes" className="back-link-purple">
          &larr; Volver a gestión de clientes
        </Link>
      </div>

      <div className="stock-header-main-row">
        <div>
          <h1 className="page-title">Stock de {cliente.nombre}</h1>
          <p className="page-subtitle">Código Cliente: {cliente.codigoCliente} | Día de Reparto: {cliente.diaReparto}</p>
        </div>

        <div className="stock-header-cards-group">
          <div className="stock-header-meta-card">
            <div className="meta-card-icon-wrapper bg-light-purple">
              <User size={18} />
            </div>
            <div className="meta-card-text">
              <span className="meta-card-label">Razón Social</span>
              <span className="meta-card-value">{cliente.nombre}</span>
              <span className="meta-card-subtext">Cód: {cliente.codigoCliente}</span>
            </div>
          </div>

          <div className="stock-header-meta-card">
            <div className="meta-card-icon-wrapper bg-light-blue">
              <MapPin size={18} />
            </div>
            <div className="meta-card-text">
              <span className="meta-card-label">Dirección</span>
              <span className="meta-card-value truncate max-w-xs">{cliente.direccion}</span>
              <span className="meta-card-subtext">Reparto: {cliente.diaReparto}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="stock-controls-card">
        <div className="stock-search-filter-row">
          <div className="stock-search-input-wrapper">
            <Search size={18} className="search-icon-inside" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="stock-search-input"
            />
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="stock-table-card-v2">
        <div className="table-responsive-wrapper">
          {filteredStock.length === 0 ? (
            <div className="no-results-card">
              <p>El cliente no posee ítems registrados en su inventario para esta búsqueda.</p>
            </div>
          ) : (
            <table className="stock-table-v2">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Stock Registrado</th>
                  <th>Stock Crítico</th>
                  <th>Última Actualización</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((item) => {
                  const prod = item.productoId;
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
                        <span className="stock-qty-text font-bold">
                          {item.cantidad} <small className="text-muted font-normal">unidades</small>
                        </span>
                      </td>
                      <td className="text-muted text-sm">{prod.stockCritico} uds</td>
                      <td className="text-muted text-sm">
                        {new Date(item.ultimaActualizacion).toLocaleDateString('es-UY', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <span className={`stock-status-pill ${status.badgeClass}`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockClienteAdmin;
