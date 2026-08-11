import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let PrismaClient;
try {
  // En desarrollo (o si el asar lo permite)
  PrismaClient = require('@prisma/client').PrismaClient;
} catch (e) {
  // En producción, electron-builder elimina .prisma de app.asar.
  // Lo cargamos desde app.asar.unpacked donde garantizamos su existencia con extraResources.
  const path = require('path');
  const { app } = require('electron');
  const unpackedPath = path.join(app.getAppPath(), '..', 'app.asar.unpacked', 'node_modules', '@prisma', 'client');
  PrismaClient = require(unpackedPath).PrismaClient;
}

/**
 * Cliente singleton de Prisma ORM
 */
const prisma = new PrismaClient();

export default prisma;
