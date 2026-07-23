import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Producto from '../models/Producto.js';
import Cliente from '../models/Cliente.js';
import Administrador from '../models/Administrador.js';
import Novedad from '../models/Novedad.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('--- Starting Seeding Process ---');

    // 1. Seed Products from Excel
    const productCount = await Producto.countDocuments();
    if (productCount === 0) {
      console.log('Seeding products from ListaProductos.xlsx...');
      const excelPath = path.join(__dirname, '../../ListaProductos.xlsx');
      const workbook = xlsx.readFile(excelPath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      const productsToInsert = data.map(item => ({
        codigo: String(item['CÓDIGO'] || '').trim(),
        nombre: String(item['NOMBRE'] || '').trim(),
        marca: String(item['MARCA'] || '').trim(),
        precioSinIVA: Number(item['PRECIO SIN IVA U$S'] || 0),
        stockCritico: Number(item['STOCK CRITICO'] || 0),
        imagen: String(item['IMAGEN'] || '').trim()
      }));

      await Producto.insertMany(productsToInsert);
      console.log(`Successfully seeded ${productsToInsert.length} products.`);
    } else {
      console.log(`Products collection already has ${productCount} documents. Skipping product seed.`);
    }

    // 2. Seed Clients (3 clients)
    const clientCount = await Cliente.countDocuments();
    if (clientCount === 0) {
      console.log('Seeding clients...');
      const clients = [
        {
          codigoCliente: 'cli001',
          nombre: 'Ferretería Central',
          direccion: 'Av. 18 de Julio 1234',
          diaReparto: 'Lunes',
          contrasena: 'password123' // Will be hashed via pre-save middleware
        },
        {
          codigoCliente: 'cli002',
          nombre: 'Barraca Del Paso',
          direccion: 'Av. Millán 4567',
          diaReparto: 'Miércoles',
          contrasena: 'password123'
        },
        {
          codigoCliente: 'cli003',
          nombre: 'Ferretería Industrial',
          direccion: 'Ruta 5 Km 12',
          diaReparto: 'Viernes',
          contrasena: 'password123'
        }
      ];

      // Insert sequentially so pre-save middlewares run properly
      for (const client of clients) {
        await Cliente.create(client);
      }
      console.log('Successfully seeded 3 clients.');
    } else {
      console.log(`Clients collection already has ${clientCount} documents. Skipping client seed.`);
    }

    // 3. Seed Administrators (2 admins)
    const adminCount = await Administrador.countDocuments();
    if (adminCount === 0) {
      console.log('Seeding administrators...');
      const admins = [
        {
          usuario: 'admin01',
          contrasena: 'adminpassword' // Will be hashed via pre-save middleware
        },
        {
          usuario: 'admin02',
          contrasena: 'adminpassword'
        }
      ];

      for (const admin of admins) {
        await Administrador.create(admin);
      }
      console.log('Successfully seeded 2 administrators.');
    } else {
      console.log(`Administrators collection already has ${adminCount} documents. Skipping admin seed.`);
    }

    // 4. Seed Novedad (1 novelty)
    const noveltyCount = await Novedad.countDocuments();
    if (noveltyCount === 0) {
      console.log('Seeding novelty...');
      await Novedad.create({
        archivoUrl: 'Novedad.png',
        fechaActualizacion: new Date()
      });
      console.log('Successfully seeded 1 novelty.');
    } else {
      console.log(`Novedades collection already has ${noveltyCount} documents. Skipping novelty seed.`);
    }

    console.log('--- Seeding Process Finished Successfully ---');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
