import mongoose from 'mongoose';

const notificacionSchema = new mongoose.Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  mensaje: {
    type: String,
    required: true,
    trim: true
  },
  tipo: {
    type: String,
    enum: ['pedido', 'stock', 'novedad', 'sistema'],
    default: 'sistema'
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  leida: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Notificacion = mongoose.model('Notificacion', notificacionSchema);
export default Notificacion;
