import jwt from 'jsonwebtoken';
import Cliente from '../models/Cliente.js';
import Administrador from '../models/Administrador.js';

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token valid for 30 days
  });
};

// @desc    Authenticate user (Client or Admin) & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { role, contrasena } = req.body;

  try {
    if (!role || !contrasena) {
      return res.status(400).json({ message: 'Por favor complete todos los campos' });
    }

    if (role === 'cliente') {
      const { codigoCliente } = req.body;
      if (!codigoCliente) {
        return res.status(400).json({ message: 'Por favor ingrese el código de cliente' });
      }

      // Find client
      const client = await Cliente.findOne({ codigoCliente });
      if (!client) {
        return res.status(401).json({ message: 'Código de cliente o contraseña incorrectos' });
      }

      // Check password
      const isMatch = await client.comparePassword(contrasena);
      if (!isMatch) {
        return res.status(401).json({ message: 'Código de cliente o contraseña incorrectos' });
      }

      // Return token and data
      return res.json({
        token: generateToken(client._id, 'cliente'),
        user: {
          _id: client._id,
          codigoCliente: client.codigoCliente,
          nombre: client.nombre,
          direccion: client.direccion,
          diaReparto: client.diaReparto,
          role: 'cliente'
        }
      });
    } else if (role === 'admin') {
      const { usuario } = req.body;
      if (!usuario) {
        return res.status(400).json({ message: 'Por favor ingrese el usuario administrador' });
      }

      // Find administrator
      const admin = await Administrador.findOne({ usuario });
      if (!admin) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }

      // Check password
      const isMatch = await admin.comparePassword(contrasena);
      if (!isMatch) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }

      // Return token and data
      return res.json({
        token: generateToken(admin._id, 'admin'),
        user: {
          _id: admin._id,
          usuario: admin.usuario,
          role: 'admin'
        }
      });
    } else {
      return res.status(400).json({ message: 'Rol inválido especificado' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error del servidor al intentar iniciar sesión' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      _id: req.user._id,
      nombre: req.user.nombre || req.user.usuario,
      codigoCliente: req.user.codigoCliente,
      usuario: req.user.usuario,
      direccion: req.user.direccion,
      diaReparto: req.user.diaReparto,
      role: req.user.role
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error del servidor al obtener perfil' });
  }
};
