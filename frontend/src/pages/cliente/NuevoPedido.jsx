import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { NotificationContext } from '../../context/NotificationContext';
import SuccessOverlay from '../../components/SuccessOverlay';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  FileText,
  ShoppingBag,
  ArrowDown
} from 'lucide-react';

const QtyInput = ({ value, onChange, onBlur, className }) => {
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value);
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setVal('');
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      setVal(parsed);
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    if (val === '' || isNaN(val) || val < 1) {
      setVal(1);
      if (onBlur) onBlur(1);
    } else {
      if (onBlur) onBlur(val);
    }
  };

  return (
    <input
      type="number"
      min="1"
      value={val}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
};

const NuevoPedido = () => {
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    getCartSubtotal, 
    clearCart 
  } = useContext(CartContext);
  
  const { showToast } = useContext(NotificationContext);
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Success Overlay state
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  // Fetch catalog function
  const fetchProductos = async (searchQuery = '') => {
    try {
      setLoading(true);
      const res = await api.get('/productos', {
        params: { search: searchQuery }
      });
      setProductos(res.data);
    } catch (err) {
      console.error('Error fetching catalog:', err);
      setError('No se pudo cargar el catálogo de productos.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProductos(search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpenCatalog = () => {
    window.open('http://localhost:5001/images/CatalogoJulio.pdf', '_blank');
  };

  const handleConfirmarPedido = async () => {
    if (cartItems.length === 0) {
      showToast('Error', 'El carrito está vacío');
      return;
    }

    if (observaciones.length > 500) {
      showToast('Error', 'Las observaciones superan los 500 caracteres');
      return;
    }

    try {
      setSubmitting(true);
      const itemsToPost = cartItems.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad
      }));

      const res = await api.post('/pedidos', {
        items: itemsToPost,
        observaciones: observaciones
      });

      const rawId = res.data?.pedidoId;
      const formattedNum = rawId ? `#${rawId.toString().slice(-6).toUpperCase()}` : '';

      setCreatedOrderNumber(formattedNum);
      setShowSuccessOverlay(true);

    } catch (err) {
      console.error('Error submitting order:', err);
      showToast('Error', err.response?.data?.message || 'Error al procesar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessOverlayComplete = () => {
    setShowSuccessOverlay(false);
    clearCart();
    navigate('/mis-pedidos');
  };

  const scrollToCart = () => {
    const element = document.getElementById('cart-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getProductImageUrl = (filename) => {
    if (!filename) return 'https://via.placeholder.com/150?text=Sin+Imagen';
    return `http://localhost:5001/images/ImagenesCatalogo/${filename}`;
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="nuevo-pedido-page">
      <div className="page-header-container">
        <div>
          <h1 className="page-title">Nuevo Pedido</h1>
          <p className="page-subtitle">Busca productos en nuestra lista oficial y arma tu pedido.</p>
        </div>
        
        <button className="secondary-action-btn btn-catalog-nowrap" onClick={handleOpenCatalog}>
          <FileText size={16} />
          <span>Ver Catálogo</span>
        </button>
      </div>

      <div className="nuevo-pedido-grid">
        {/* Left Section: Search and Product Catalog */}
        <div className="catalog-section">
          <div className="search-bar-container">
            <Search size={18} className="search-bar-icon" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="clear-search-btn" onClick={() => setSearch('')}>
                &times;
              </button>
            )}
          </div>

          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <p>Buscando productos...</p>
            </div>
          ) : error ? (
            <div className="error-box">{error}</div>
          ) : productos.length === 0 ? (
            <div className="empty-catalog-state">
              <p>No se encontraron productos que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <div className="products-grid">
              {productos.map((prod) => {
                const inCart = cartItems.find(item => item.productoId === prod._id);
                return (
                  <div key={prod._id} className="product-card">
                    <div className="product-card-img-container">
                      <img 
                        src={getProductImageUrl(prod.imagen)} 
                        alt={prod.nombre} 
                        className="product-card-img"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=Sin+Imagen';
                        }}
                      />
                    </div>
                    <div className="product-card-body">
                      <span className="product-card-brand">{prod.marca}</span>
                      <h4 className="product-card-title">{prod.nombre}</h4>
                      <span className="product-card-code">Código: {prod.codigo}</span>
                      
                      <div className="product-card-footer">
                        <span className="product-card-price">U$S {prod.precioSinIVA.toFixed(2)} <small className="price-tax-note">S/IVA</small></span>
                        
                        {inCart ? (
                          <div className="product-card-qty-control">
                            <button 
                              className="qty-btn" 
                              onClick={() => updateQuantity(prod._id, inCart.cantidad - 1)}
                            >
                              <Minus size={12} />
                            </button>
                            <QtyInput 
                              value={inCart.cantidad} 
                              className="qty-input-field"
                              onChange={(qty) => updateQuantity(prod._id, qty)}
                              onBlur={(qty) => updateQuantity(prod._id, qty)}
                            />
                            <button 
                              className="qty-btn" 
                              onClick={() => updateQuantity(prod._id, inCart.cantidad + 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="add-to-cart-btn"
                            onClick={() => addToCart(prod, 1)}
                          >
                            <ShoppingCart size={14} />
                            <span>Agregar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Section: Shopping Cart Sidebar */}
        <div className="cart-section" id="cart-section">
          <div className="cart-card">
            <div className="cart-card-header">
              <div className="cart-title-wrapper">
                <ShoppingBag size={20} className="cart-header-icon" />
                <h3 className="cart-title">Resumen de Pedido</h3>
              </div>
              <span className="cart-items-count-badge">
                {totalCartCount} {totalCartCount === 1 ? 'producto' : 'productos'}
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="empty-cart-state">
                <ShoppingCart size={36} className="empty-cart-icon" />
                <p className="empty-cart-text">Tu carrito está vacío</p>
                <span className="empty-cart-subtext">Selecciona productos de la lista para agregarlos a tu pedido.</span>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <div key={item.productoId} className="cart-item-row">
                      <img 
                        src={getProductImageUrl(item.imagen)} 
                        alt={item.nombre} 
                        className="cart-item-img"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=Sin+Imagen';
                        }}
                      />
                      <div className="cart-item-details">
                        <span className="cart-item-title" title={item.nombre}>{item.nombre}</span>
                        <span className="cart-item-brand-code">{item.marca} • Cód: {item.codigo}</span>
                        <div className="cart-item-price-row">
                          <span className="cart-item-unit-price">U$S {item.precioSinIVA.toFixed(2)} c/u</span>
                          <span className="cart-item-subtotal">USD {(item.precioSinIVA * item.cantidad).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="cart-item-actions">
                        <div className="cart-qty-controls">
                          <button 
                            className="qty-btn-sm" 
                            onClick={() => updateQuantity(item.productoId, item.cantidad - 1)}
                          >
                            <Minus size={10} />
                          </button>
                          <QtyInput 
                            value={item.cantidad} 
                            className="qty-input-field-sm"
                            onChange={(qty) => updateQuantity(item.productoId, qty)}
                            onBlur={(qty) => updateQuantity(item.productoId, qty)}
                          />
                          <button 
                            className="qty-btn-sm" 
                            onClick={() => updateQuantity(item.productoId, item.cantidad + 1)}
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <button 
                          className="cart-remove-btn" 
                          onClick={() => removeFromCart(item.productoId)}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-observations">
                  <label htmlFor="obs-input">
                    <span>Observaciones para el pedido</span>
                    <span className={`char-counter ${observaciones.length > 450 ? 'text-red' : ''}`}>
                      {observaciones.length}/500
                    </span>
                  </label>
                  <textarea
                    id="obs-input"
                    rows="3"
                    placeholder="Escribe alguna indicación especial para WEB LTDA (máx. 500 caracteres)..."
                    value={observaciones}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setObservaciones(e.target.value);
                      }
                    }}
                  ></textarea>
                </div>

                <div className="cart-summary-totals">
                  <div className="total-row">
                    <span>Subtotal (Sin IVA):</span>
                    <strong className="total-price">U$S {getCartSubtotal().toFixed(2)}</strong>
                  </div>
                </div>

                <button 
                  className="confirm-order-btn"
                  onClick={handleConfirmarPedido}
                  disabled={submitting}
                >
                  {submitting ? 'Confirmando pedido...' : 'Confirmar Pedido'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Mobile Cart Shortcut Bar */}
      {cartItems.length > 0 && (
        <div className="mobile-cart-floating-bar" onClick={scrollToCart}>
          <div className="mobile-cart-bar-info">
            <ShoppingBag size={18} />
            <span><strong>{totalCartCount}</strong> {totalCartCount === 1 ? 'producto' : 'productos'} (U$S {getCartSubtotal().toFixed(2)})</span>
          </div>
          <button className="mobile-cart-bar-btn">
            <span>Ver Resumen</span>
            <ArrowDown size={14} />
          </button>
        </div>
      )}

      {/* Modern Fullscreen Success Overlay */}
      <SuccessOverlay
        visible={showSuccessOverlay}
        title="Pedido enviado correctamente"
        message="Tu pedido fue registrado correctamente. En unos segundos podrás consultar su estado."
        orderNumber={createdOrderNumber}
        duration={2200}
        onComplete={handleSuccessOverlayComplete}
      />
    </div>
  );
};

export default NuevoPedido;
