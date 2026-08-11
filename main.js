import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar e iniciar el backend Express.
// Al importarlo, arranca el servidor Express y Prisma en el mismo proceso de Node.js que Electron.
// Esto evita la necesidad de manejar procesos huérfanos de manera compleja.
import './backend/src/server.js';

let mainWindow;

function checkBackendHealth() {
  return new Promise((resolve) => {
    const check = () => {
      http.get('http://localhost:3000/health', (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          setTimeout(check, 500);
        }
      }).on('error', () => {
        setTimeout(check, 500);
      });
    };
    check();
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    autoHideMenuBar: true,
    title: 'AcademiaPro',
    icon: path.join(__dirname, 'frontend/public/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Mostrar mensaje de carga o simplemente no mostrar ventana hasta que esté listo
  // mainWindow.loadFile('loading.html'); // opcional

  // Esperar a que el backend esté levantado y conectado a DB
  await checkBackendHealth();

  // Cargar la aplicación servida por el servidor Express
  mainWindow.loadURL('http://localhost:3000');
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // El backend Node/Express corre en este mismo hilo.
  // Cuando Electron hace app.quit(), mata automáticamente este proceso, 
  // por lo que el puerto 3000 se libera limpiamente.
  process.exit(0);
});
