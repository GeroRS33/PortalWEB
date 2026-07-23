import mongoose from 'mongoose';

const novedadSchema = new mongoose.Schema({
  archivoUrl: {
    type: String,
    required: true,
    trim: true
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Novedad = mongoose.model('Novedad', novedadSchema);
export default Novedad;
