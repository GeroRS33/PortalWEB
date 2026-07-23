import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  marca: {
    type: String,
    required: true,
    trim: true
  },
  precioSinIVA: {
    type: Number,
    required: true,
    min: 0
  },
  stockCritico: {
    type: Number,
    required: true,
    min: 0
  },
  imagen: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const Producto = mongoose.model('Producto', productoSchema);
export default Producto;
