import StockCliente from '../models/StockCliente.js';
import Producto from '../models/Producto.js';
import Notificacion from '../models/Notificacion.js';

// @desc    Get client stock
// @route   GET /api/stock
// @access  Private (Client only)
export const getMyStock = async (req, res) => {
  try {
    const stock = await StockCliente.find({ clienteId: req.user._id })
      .populate('productoId');

    // Sort by product code (codigo)
    const sortedStock = stock
      .filter(item => item.productoId) // Safety check
      .sort((a, b) => {
        return String(a.productoId.codigo).localeCompare(String(b.productoId.codigo));
      });

    res.json(sortedStock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ message: 'Error del servidor al obtener el stock' });
  }
};

// @desc    Get specific client stock
// @route   GET /api/stock/cliente/:clienteId
// @access  Private (Admin only)
export const getClienteStock = async (req, res) => {
  try {
    const stock = await StockCliente.find({ clienteId: req.params.clienteId })
      .populate('productoId');

    // Sort by product code (codigo)
    const sortedStock = stock
      .filter(item => item.productoId)
      .sort((a, b) => {
        return String(a.productoId.codigo).localeCompare(String(b.productoId.codigo));
      });

    res.json(sortedStock);
  } catch (error) {
    console.error('Error fetching client stock:', error);
    res.status(500).json({ message: 'Error del servidor al obtener el stock del cliente' });
  }
};

// @desc    Update client stock manually
// @route   PUT /api/stock
// @access  Private (Client only)
export const updateStock = async (req, res) => {
  const { productoId, cantidad } = req.body;

  try {
    if (cantidad === undefined || cantidad === null) {
      return res.status(400).json({ message: 'La cantidad es requerida' });
    }

    const qty = Number(cantidad);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ message: 'La cantidad debe ser un número no negativo' });
    }

    // Check if product exists
    const product = await Producto.findById(productoId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Find existing stock or create if not exists
    let stockItem = await StockCliente.findOne({
      clienteId: req.user._id,
      productoId: product._id
    });

    if (stockItem) {
      stockItem.cantidad = qty;
      stockItem.ultimaActualizacion = new Date();
      await stockItem.save();
    } else {
      stockItem = new StockCliente({
        clienteId: req.user._id,
        productoId: product._id,
        cantidad: qty,
        ultimaActualizacion: new Date()
      });
      await stockItem.save();
    }

    // Create Notification
    const notifStock = new Notificacion({
      clienteId: req.user._id,
      titulo: 'Stock Actualizado',
      mensaje: `Actualizaste el inventario de "${product.nombre}" a ${qty} unidades.`,
      tipo: 'stock'
    });
    await notifStock.save();

    // Return updated populated record
    const updatedRecord = await StockCliente.findById(stockItem._id).populate('productoId');

    res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar stock' });
  }
};
