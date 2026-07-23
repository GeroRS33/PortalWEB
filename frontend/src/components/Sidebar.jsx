import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { 
  Home, 
  PlusCircle, 
  ShoppingBag, 
  Layers, 
  Megaphone, 
  Users, 
  Headphones,
  X 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useContext(UserContext);

  if (!user) return null;

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`sidebar-mobile-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose} 
      />

      <aside className={`app-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Mobile Header Close Button */}
        <div className="sidebar-mobile-header">
          <span className="sidebar-mobile-title">
            {user.role === 'cliente' ? 'Menú Principal' : 'Administración'}
          </span>
          <button className="sidebar-close-btn" onClick={onClose} title="Cerrar Menú">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {user.role === 'cliente' ? (
            <>
              <div className="nav-section-title">Portal Cliente</div>
              <NavLink 
                to="/" 
                end 
                onClick={handleNavClick}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Home size={18} />
                <span>Inicio</span>
              </NavLink>

              <NavLink 
                to="/nuevo-pedido" 
                onClick={handleNavClick}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <PlusCircle size={18} />
                <span>Nuevo Pedido</span>
              </NavLink>

              <NavLink 
                to="/mis-pedidos" 
                onClick={handleNavClick}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <ShoppingBag size={18} />
                <span>Mis Pedidos</span>
              </NavLink>

              <NavLink 
                to="/mi-stock" 
                onClick={handleNavClick}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Layers size={18} />
                <span>Mi Stock</span>
              </NavLink>

              <NavLink 
                to="/novedades" 
                onClick={handleNavClick}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Megaphone size={18} />
                <span>Novedades</span>
              </NavLink>
            </>
          ) : (
            <>
              <div className="nav-section-title">ADMINISTRACIÓN</div>
              <NavLink 
                to="/admin/inicio" 
                onClick={handleNavClick}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Home size={18} />
                <span>Inicio</span>
              </NavLink>

              <NavLink 
                to="/admin/pedidos" 
                onClick={handleNavClick}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <ShoppingBag size={18} />
                <span>Pedidos</span>
              </NavLink>

              <NavLink 
                to="/admin/clientes" 
                onClick={handleNavClick}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Users size={18} />
                <span>Clientes</span>
              </NavLink>

              <NavLink 
                to="/admin/novedades" 
                onClick={handleNavClick}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Megaphone size={18} />
                <span>Novedades</span>
              </NavLink>
            </>
          )}
        </nav>
        
        <div className="sidebar-footer">
          <div className="sidebar-help-card">
            <div className="help-card-header">
              <Headphones size={22} className="help-card-icon" />
              <span className="help-card-title">¿Necesitás ayuda?</span>
            </div>
            <div className="help-card-body">
              <p className="help-card-sub">Soporte Comercial</p>
              <p className="help-card-phone">2900 1234</p>
              <p className="help-card-email">soporte@webltda.com.uy</p>
            </div>
          </div>

          <span className="version-tag">PortalWEB v1.0.0 (MVP)</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
