import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { LogOut, User, Calendar, MapPin, Menu } from 'lucide-react';

const Header = ({ onToggleMobileMenu }) => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // URL encoded paths for local SVG images served by the backend
  const logoUrl = 'http://localhost:5001/images/Elementos%20Gra%CC%81ficos/Logo_PortalWEB.svg';

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleMobileMenu} title="Abrir Menú">
          <Menu size={22} />
        </button>
        <img src={logoUrl} alt="Logo PortalWEB" className="header-logo" />
      </div>

      <div className="header-right">
        <div className="user-profile-info">
          <div className="user-avatar">
            <User size={18} />
          </div>
          <div className="user-details">
            <span className="user-name">{user.nombre || user.usuario}</span>
            <span className="user-role">
              {user.role === 'admin' ? 'Administrador' : `Cliente: ${user.codigoCliente}`}
            </span>
          </div>
        </div>

        {user.role === 'cliente' && (
          <div className="delivery-badge-group">
            <div className="delivery-badge" title="Día de Reparto">
              <Calendar size={14} />
              <span>Reparto: {user.diaReparto}</span>
            </div>
            <div className="delivery-badge address-badge" title="Dirección de entrega">
              <MapPin size={14} />
              <span>{user.direccion}</span>
            </div>
          </div>
        )}

        <button className="logout-btn" onClick={handleLogout} title="Cerrar Sesión">
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
