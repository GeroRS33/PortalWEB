import mongoose from 'mongoose';

const stockClienteSchema = new mongoose.Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
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
    min: 0,
    default: 0
  },
  ultimaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to guarantee uniqueness of product per client
stockClienteSchema.index({ clienteId: 1, productoId: 1 }, { unique: true });

const StockCliente = mongoose.model('StockCliente', stockClienteSchema);
export default StockCliente;
