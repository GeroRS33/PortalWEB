import mongoose from 'mongoose';

const detallePedidoSchema = new mongoose.Schema({
  pedidoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pedido',
    required: true
  },
  productoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

const DetallePedido = mongoose.model('DetallePedido', detallePedidoSchema);
export default DetallePedido;
