import Cliente from '../models/Cliente.js';
import Pedido from '../models/Pedido.js';
import StockCliente from '../models/StockCliente.js';

// @desc    Get all clients
// @route   GET /api/clientes
// @access  Private (Admin only)
export const getClientes = async (req, res) => {
  try {
    const query = {};
    
    // Add search functionality if search query is provided
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { nombre: searchRegex },
        { codigoCliente: searchRegex },
        { direccion: searchRegex }
      ];
    }

    const clientes = await Cliente.find(query).select('-contrasena').sort({ codigoCliente: 1 });
    res.json(clientes);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Error del servidor al obtener listado de clientes' });
  }
};

// @desc    Get client detail (including orders and stock)
// @route   GET /api/clientes/:id
// @access  Private (Admin only)
export const getClienteDetail = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).select('-contrasena');
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Get last orders for this client
    const pedidos = await Pedido.find({ clienteId: cliente._id }).sort({ fechaCreacion: -1 }).limit(10);

    // Get stock registered for this client
    const stock = await StockCliente.find({ clienteId: cliente._id }).populate('productoId');

    res.json({
      cliente,
      pedidos,
      stock
    });
  } catch (error) {
    console.error('Error fetching client detail:', error);
    res.status(500).json({ message: 'Error del servidor al obtener detalle del cliente' });
  }
};

// @desc    Create new client
// @route   POST /api/clientes
// @access  Private (Admin only)
export const createCliente = async (req, res) => {
  const { codigoCliente, nombre, direccion, diaReparto, contrasena } = req.body;

  try {
    // Validate inputs
    if (!codigoCliente || !nombre || !direccion || !diaReparto || !contrasena) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Check if client code is unique
    const clientExists = await Cliente.findOne({ codigoCliente: codigoCliente.trim() });
    if (clientExists) {
      return res.status(400).json({ message: 'Ya existe un cliente con ese código' });
    }

    const newCliente = new Cliente({
      codigoCliente: codigoCliente.trim(),
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      diaReparto: diaReparto.trim(),
      contrasena: contrasena // Hashed on pre-save hook
    });

    await newCliente.save();

    // Do not return password hash
    const responseData = newCliente.toObject();
    delete responseData.contrasena;

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Error del servidor al crear cliente' });
  }
};

// @desc    Update client
// @route   PUT /api/clientes/:id
// @access  Private (Admin only)
export const updateCliente = async (req, res) => {
  const { nombre, direccion, diaReparto, contrasena } = req.body;

  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Update allowed fields
    if (nombre) cliente.nombre = nombre.trim();
    if (direccion) cliente.direccion = direccion.trim();
    if (diaReparto) cliente.diaReparto = diaReparto.trim();
    if (contrasena && contrasena.trim() !== '') {
      cliente.contrasena = contrasena; // Hashed on pre-save hook
    }

    await cliente.save();

    const responseData = cliente.toObject();
    delete responseData.contrasena;

    res.json(responseData);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar cliente' });
  }
};
