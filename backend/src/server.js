import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurar que siempre se lea el .env del backend, independientemente de dónde se llame
dotenv.config({ path: path.join(__dirname, '../.env') });
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log simple de solicitudes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Ruta de comprobación de estado de salud del servidor
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'AcademiaPro API',
    academy: 'Unión Jaguera FC',
    timestamp: new Date()
  });
});

// Enrutamiento de la API central
app.use('/api', apiRoutes);

// Servir frontend compilado (Producción/Electron)
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Fallback para Vue Router (Cualquier ruta no de API sirve index.html)
app.get('*', (req, res) => {
  if (!req.url.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// Middleware centralizado para manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Servidor AcademiaPro corriendo en puerto ${PORT}`);
  console.log(` API Endpoint: http://localhost:${PORT}/api`);
  console.log(` Academia: Unión Jaguera FC (La Jagua de Ibirico)`);
  console.log(`==================================================`);
});

export default app;
