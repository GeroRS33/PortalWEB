import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="global-loader-container">
        <div className="loader"></div>
        <p>Cargando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If client tries to access admin routes or vice versa, redirect them to their respective home
    return <Navigate to={user.role === 'admin' ? '/admin/pedidos' : '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
