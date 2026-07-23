import jwt from 'jsonwebtoken';
import Cliente from '../models/Cliente.js';
import Administrador from '../models/Administrador.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from bearer
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check role and fetch user info
      if (decoded.role === 'cliente') {
        req.user = await Cliente.findById(decoded.id).select('-contrasena');
        if (!req.user) {
          return res.status(401).json({ message: 'Usuario no encontrado' });
        }
        req.user.role = 'cliente';
      } else if (decoded.role === 'admin') {
        req.user = await Administrador.findById(decoded.id).select('-contrasena');
        if (!req.user) {
          return res.status(401).json({ message: 'Administrador no encontrado' });
        }
        req.user.role = 'admin';
      } else {
        return res.status(401).json({ message: 'Rol inválido en token' });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error);
      return res.status(401).json({ message: 'No autorizado, token falló' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, sin token' });
  }
};

// Middleware to restrict access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Acceso denegado para el rol: ${req.user ? req.user.role : 'invitado'}` });
    }
    next();
  };
};
