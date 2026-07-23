import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const clienteSchema = new mongoose.Schema({
  codigoCliente: {
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
  direccion: {
    type: String,
    required: true,
    trim: true
  },
  diaReparto: {
    type: String,
    required: true,
    trim: true
  },
  contrasena: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Middleware to hash password before saving
clienteSchema.pre('save', async function(next) {
  if (!this.isModified('contrasena')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
clienteSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.contrasena);
};

const Cliente = mongoose.model('Cliente', clienteSchema);
export default Cliente;
