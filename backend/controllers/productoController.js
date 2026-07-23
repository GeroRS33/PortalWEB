import Producto from '../models/Producto.js';

// @desc    Get all products (with search filter)
// @route   GET /api/productos
// @access  Private (Authenticated users)
export const getProductos = async (req, res) => {
  try {
    const query = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { codigo: searchRegex },
        { nombre: searchRegex },
        { marca: searchRegex }
      ];
    }

    const productos = await Producto.find(query).sort({ nombre: 1 });
    res.json(productos);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error del servidor al buscar productos' });
  }
};
