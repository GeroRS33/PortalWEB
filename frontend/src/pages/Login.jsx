import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { Eye, EyeOff, Lock, User as UserIcon, HelpCircle } from 'lucide-react';

const Login = () => {
  const { user, login, error } = useContext(UserContext);
  const [role, setRole] = useState('cliente'); // default role is 'cliente'
  const [codigoCliente, setCodigoCliente] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/pedidos');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      const credentials = role === 'cliente' 
        ? { codigoCliente: codigoCliente.trim(), contrasena }
        : { usuario: usuario.trim(), contrasena };

      const userData = await login(role, credentials);
      if (userData.role === 'admin') {
        navigate('/admin/pedidos');
      } else {
        navigate('/');
      }
    } catch (err) {
      setLocalError(err.message || 'Error de credenciales');
    } finally {
      setLoading(false);
    }
  };

  const logoUrl = 'http://localhost:5001/images/Elementos%20Gra%CC%81ficos/Logo_PortalWEB.svg';

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logoUrl} alt="PortalWEB Logo" className="login-logo" />
          <h2 className="login-title">Ingreso al Sistema</h2>
          <p className="login-subtitle">Bienvenido al portal oficial de pedidos de WEB LTDA.</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="role-selector-tabs">
          <button
            type="button"
            className={`role-tab-btn ${role === 'cliente' ? 'active' : ''}`}
            onClick={() => {
              setRole('cliente');
              setLocalError('');
            }}
          >
            Cliente
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setRole('admin');
              setLocalError('');
            }}
          >
            Administrador
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {role === 'cliente' ? (
            <div className="form-group">
              <label htmlFor="codigoCliente">Código de Cliente</label>
              <div className="input-with-icon">
                <UserIcon size={18} className="input-icon" />
                <input
                  type="text"
                  id="codigoCliente"
                  placeholder="Ej: cli001"
                  value={codigoCliente}
                  onChange={(e) => setCodigoCliente(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="usuario">Usuario Administrador</label>
              <div className="input-with-icon">
                <UserIcon size={18} className="input-icon" />
                <input
                  type="text"
                  id="usuario"
                  placeholder="Ej: admin01"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="contrasena"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {(localError || error) && (
            <div className="login-error-message">
              {localError || error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-footer">
          <HelpCircle size={14} />
          <span>Si tienes problemas para ingresar, comunícate con soporte de WEB LTDA.</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
