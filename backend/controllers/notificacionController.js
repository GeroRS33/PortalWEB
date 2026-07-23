import Notificacion from '../models/Notificacion.js';

// @desc    Get unread notifications for logged-in client
// @route   GET /api/notificaciones
// @access  Private (Client only)
export const getMyNotifications = async (req, res) => {
  try {
    const filter = { clienteId: req.user._id };
    if (req.query.all !== 'true') {
      filter.leida = false;
    }
    const notificaciones = await Notificacion.find(filter)
      .sort({ fecha: -1 })
      .limit(20);

    res.json(notificaciones);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error del servidor al obtener notificaciones' });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notificaciones/:id/leer
// @access  Private (Client only)
export const readNotification = async (req, res) => {
  try {
    const notificacion = await Notificacion.findById(req.params.id);
    if (!notificacion) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    if (notificacion.clienteId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    notificacion.leida = true;
    await notificacion.save();

    res.json({ message: 'Notificación marcada como leída', notificacion });
  } catch (error) {
    console.error('Error reading notification:', error);
    res.status(500).json({ message: 'Error del servidor al leer notificación' });
  }
};
