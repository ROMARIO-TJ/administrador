import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

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
