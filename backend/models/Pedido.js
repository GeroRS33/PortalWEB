import mongoose from 'mongoose';

const pedidoSchema = new mongoose.Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['Generado', 'Confirmado', 'En preparación', 'Entregado', 'Cancelado'],
    default: 'Generado',
    required: true
  },
  observaciones: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

const Pedido = mongoose.model('Pedido', pedidoSchema);
export default Pedido;
