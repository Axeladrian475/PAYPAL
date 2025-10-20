// app.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import catalogoRoutes from './routes/catalogoRouters.js';
import pedidosRoutes from './routes/pedidosRoutes.js';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Crear la instancia principal de la aplicación Express
const app = express();

// === MIDDLEWARE ===
// Habilitar CORS para permitir que tu API sea consultada desde otros dominios
app.use(cors());
// Permitir que el servidor entienda peticiones con cuerpo en formato JSON
app.use(express.json());


// === RUTAS ===
// Conectar las rutas definidas en catalogoRouters.js a la aplicación principal
// Todas las rutas en ese archivo ahora comenzarán con /api
app.use('/api', catalogoRoutes);
app.use('/api/orders', pedidosRoutes);


// === INICIAR SERVIDOR ===
// Obtener el puerto desde las variables de entorno, con un valor por defecto
const PORT = process.env.PORT || 4000;

// Poner el servidor a la escucha en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});