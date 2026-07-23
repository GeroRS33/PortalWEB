import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productoRoutes from './routes/productoRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import novedadRoutes from './routes/novedadRoutes.js';
import notificacionRoutes from './routes/notificacionRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets from the Imagenes folder in the root workspace
app.use('/images', express.static(path.join(__dirname, '../Imagenes')));

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/novedades', novedadRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/asistente', assistantRoutes);

// Root path handler
app.get('/', (req, res) => {
  res.send('Portal WEB API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Ocurrió un error interno en el servidor'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in development mode`);
});
