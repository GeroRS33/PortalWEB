import Pedido from '../models/Pedido.js';
import DetallePedido from '../models/DetallePedido.js';
import Producto from '../models/Producto.js';
import Notificacion from '../models/Notificacion.js';
import StockCliente from '../models/StockCliente.js';
import Cliente from '../models/Cliente.js';

// @desc    Create a new order
// @route   POST /api/pedidos
// @access  Private (Client only)
export const createPedido = async (req, res) => {
  const { items, observaciones } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'El carrito no puede estar vacío' });
    }

    if (observaciones && observaciones.length > 500) {
      return res.status(400).json({ message: 'Las observaciones no pueden superar los 500 caracteres' });
    }

    // Create Pedido
    const newPedido = new Pedido({
      clienteId: req.user._id,
      observaciones: observaciones ? observaciones.trim() : ''
    });

    await newPedido.save();

    // Create DetallePedido for each item
    for (const item of items) {
      const product = await Producto.findById(item.productoId);
      if (!product) {
        return res.status(404).json({ message: `Producto con ID ${item.productoId} no encontrado` });
      }

      const cantidad = Number(item.cantidad);
      if (cantidad <= 0) {
        return res.status(400).json({ message: 'La cantidad debe ser mayor a cero' });
      }

      const newDetalle = new DetallePedido({
        pedidoId: newPedido._id,
        productoId: product._id,
        cantidad: cantidad,
        precioUnitario: product.precioSinIVA
      });

      await newDetalle.save();
    }

    // Create Notification
    const newNotification = new Notificacion({
      clienteId: req.user._id,
      titulo: 'Pedido Generado con Éxito',
      mensaje: `Tu pedido #${newPedido._id.toString().slice(-6).toUpperCase()} ha sido registrado con éxito.`,
      tipo: 'pedido'
    });
    await newNotification.save();

    res.status(201).json({
      message: 'Pedido confirmado con éxito',
      pedidoId: newPedido._id
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error del servidor al crear pedido' });
  }
};

// @desc    Get all orders
// @route   GET /api/pedidos
// @access  Private (Client or Admin)
export const getPedidos = async (req, res) => {
  try {
    let query = {};

    // Filter by client if client role
    if (req.user.role === 'cliente') {
      query.clienteId = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin search capabilities
      if (req.query.search) {
        const searchVal = req.query.search.trim();
        
        // Check if searching by order ID suffix or full ID
        let orderIds = [];
        if (searchVal.length >= 4) {
          // Find orders where the ID contains or ends with searchVal
          // Using regex search on ID requires a string conversion, or we can fetch and filter
          // For simplicity, we can do a text search or find clients first
        }

        // Find matching clients first
        const clientQuery = {
          $or: [
            { nombre: new RegExp(searchVal, 'i') },
            { codigoCliente: new RegExp(searchVal, 'i') }
          ]
        };
        const matchingClients = await Cliente.find(clientQuery).select('_id');
        const clientIds = matchingClients.map(c => c._id);

        query.$or = [
          { clienteId: { $in: clientIds } }
        ];

        // Also check if search matches order ID
        if (searchVal.match(/^[0-9a-fA-F]{24}$/)) {
          query.$or.push({ _id: searchVal });
        }
      }
    }

    // Find and populate
    const pedidos = await Pedido.find(query)
      .populate('clienteId', 'nombre codigoCliente direccion diaReparto')
      .sort({ fechaCreacion: -1 });

    // For each order, append product count
    const pedidosWithCount = await Promise.all(
      pedidos.map(async (pedido) => {
        const details = await DetallePedido.find({ pedidoId: pedido._id });
        const totalItems = details.reduce((sum, item) => sum + item.cantidad, 0);
        return {
          ...pedido.toObject(),
          totalItems
        };
      })
    );

    res.json(pedidosWithCount);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error del servidor al obtener pedidos' });
  }
};

// @desc    Get order by ID
// @route   GET /api/pedidos/:id
// @access  Private (Client or Admin)
export const getPedidoById = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('clienteId', 'nombre codigoCliente direccion diaReparto');

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Safety check: clients can only view their own orders
    if (req.user.role === 'cliente' && pedido.clienteId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acceso no autorizado a este pedido' });
    }

    // Fetch order details
    const details = await DetallePedido.find({ pedidoId: pedido._id })
      .populate('productoId');

    res.json({
      pedido,
      details
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({ message: 'Error del servidor al obtener detalle del pedido' });
  }
};

const appendObservaciones = (pedido, textToAppend) => {
  let combined = `${pedido.observaciones || ''}\n${textToAppend}`.trim();
  if (combined.length > 500) {
    combined = combined.slice(0, 497) + '...';
  }
  pedido.observaciones = combined;
};

// @desc    Cancel order
// @route   POST /api/pedidos/:id/cancelar
// @access  Private (Client or Admin)
export const cancelarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Safety check for client
    if (req.user.role === 'cliente' && pedido.clienteId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    // Cancellation check: only allowed if Generado or Confirmado
    if (pedido.estado !== 'Generado' && pedido.estado !== 'Confirmado') {
      return res.status(400).json({ message: 'El pedido no puede cancelarse en su estado actual' });
    }

    pedido.estado = 'Cancelado';
    
    // Store modification reason if provided by admin
    if (req.body.motivo && req.user.role === 'admin') {
      appendObservaciones(pedido, `[Modificación Admin]: Cancelado por administrador. Motivo: ${req.body.motivo}`);
    } else if (req.user.role === 'cliente') {
      appendObservaciones(pedido, `[Modificación Cliente]: Cancelado por el cliente.`);
    }

    await pedido.save();

    // Create Notification
    const newNotification = new Notificacion({
      clienteId: pedido.clienteId,
      titulo: 'Pedido Cancelado',
      mensaje: `El pedido #${pedido._id.toString().slice(-6).toUpperCase()} ha sido cancelado.`,
      tipo: 'pedido'
    });
    await newNotification.save();

    res.json({ message: 'Pedido cancelado con éxito', pedido });
  } catch (error) {
    console.error('Error canceling order:', error);
    res.status(500).json({ message: 'Error del servidor al cancelar pedido' });
  }
};

// @desc    Update order state (Admin only)
// @route   PUT /api/pedidos/:id/estado
// @access  Private (Admin only)
export const cambiarEstadoPedido = async (req, res) => {
  const { nuevoEstado, motivo } = req.body;

  try {
    if (!nuevoEstado) {
      return res.status(400).json({ message: 'El nuevo estado es requerido' });
    }

    const estadosValidos = ['Generado', 'Confirmado', 'En preparación', 'Entregado', 'Cancelado'];
    if (!estadosValidos.includes(nuevoEstado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Rules:
    // No permitir volver hacia atrás desde Entregado
    if (pedido.estado === 'Entregado') {
      return res.status(400).json({ message: 'No se puede cambiar el estado de un pedido ya Entregado' });
    }
    // Un pedido Cancelado no puede volver a activarse
    if (pedido.estado === 'Cancelado') {
      return res.status(400).json({ message: 'No se puede reactivar un pedido Cancelado' });
    }

    // Keep reference of previous status
    const previousEstado = pedido.estado;
    pedido.estado = nuevoEstado;

    // Apply motivo if supplied
    if (motivo) {
      appendObservaciones(pedido, `[Cambio Estado]: Estado cambiado a "${nuevoEstado}". Motivo: ${motivo.trim()}`);
    }

    await pedido.save();

    // Create notification for state transition
    const notifStatus = new Notificacion({
      clienteId: pedido.clienteId,
      titulo: `Pedido ${nuevoEstado}`,
      mensaje: `Tu pedido #${pedido._id.toString().slice(-6).toUpperCase()} cambió al estado "${nuevoEstado}".`,
      tipo: 'pedido'
    });
    await notifStatus.save();

    // Special logic: If transition is to 'Entregado', update client stock automatically
    if (nuevoEstado === 'Entregado') {
      const details = await DetallePedido.find({ pedidoId: pedido._id });

      for (const item of details) {
        // Find if stock already exists for this client and product
        let stockRecord = await StockCliente.findOne({
          clienteId: pedido.clienteId,
          productoId: item.productoId
        });

        if (stockRecord) {
          stockRecord.cantidad += item.cantidad;
          stockRecord.ultimaActualizacion = new Date();
          await stockRecord.save();
        } else {
          stockRecord = new StockCliente({
            clienteId: pedido.clienteId,
            productoId: item.productoId,
            cantidad: item.cantidad,
            ultimaActualizacion: new Date()
          });
          await stockRecord.save();
        }
      }
    }

    res.json({ message: 'Estado del pedido actualizado con éxito', pedido });
  } catch (error) {
    console.error('Error changing order status:', error);
    res.status(500).json({ message: 'Error del servidor al cambiar estado' });
  }
};

// @desc    Modify order items (Admin only)
// @route   PUT /api/pedidos/:id/items
// @access  Private (Admin only)
export const modificarItemsPedido = async (req, res) => {
  const { items, motivo } = req.body;

  try {
    if (!motivo || motivo.trim() === '') {
      return res.status(400).json({ message: 'Debe ingresar un motivo para la modificación' });
    }

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    if (pedido.estado === 'Entregado' || pedido.estado === 'Cancelado') {
      return res.status(400).json({ message: 'No se puede modificar un pedido finalizado o cancelado' });
    }

    // Fetch existing details
    const existingDetails = await DetallePedido.find({ pedidoId: pedido._id });

    // Loop through the modifications proposed
    // proposed items: [{ productoId, cantidad }]
    for (const proposed of items) {
      const existing = existingDetails.find(d => d.productoId.toString() === proposed.productoId);

      if (!existing) {
        // Trying to add a new product
        return res.status(400).json({ message: 'No se permite agregar nuevos productos al pedido' });
      }

      const proposedQty = Number(proposed.cantidad);
      if (proposedQty > existing.cantidad) {
        // Trying to increase quantity
        return res.status(400).json({ message: 'No se permite aumentar la cantidad de los productos' });
      }

      if (proposedQty === 0) {
        // Remove item
        await DetallePedido.findByIdAndDelete(existing._id);
      } else if (proposedQty < 0) {
        return res.status(400).json({ message: 'La cantidad no puede ser negativa' });
      } else {
        // Reduce quantity
        existing.cantidad = proposedQty;
        await existing.save();
      }
    }

    // Append modification note to observations
    appendObservaciones(pedido, `[Modificación Admin]: Modificación de productos. Motivo: ${motivo.trim()}`);
    await pedido.save();

    // Create Notification
    const newNotification = new Notificacion({
      clienteId: pedido.clienteId,
      titulo: 'Pedido Modificado',
      mensaje: `El pedido #${pedido._id.toString().slice(-6).toUpperCase()} fue modificado por el administrador.`
    });
    await newNotification.save();

    res.json({ message: 'Pedido modificado con éxito' });
  } catch (error) {
    console.error('Error modifying order items:', error);
    res.status(500).json({ message: 'Error del servidor al modificar productos' });
  }
};
