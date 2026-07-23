import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const administradorSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: true,
    unique: true,
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
administradorSchema.pre('save', async function(next) {
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
administradorSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.contrasena);
};

const Administrador = mongoose.model('Administrador', administradorSchema);
export default Administrador;
