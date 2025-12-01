import express from 'express';

import cookieParser from 'cookie-parser';
import registerRoutes from '@/routes.js';

import { AppContextService } from '@/services/app-context-service.js';

const PORT = 9292;

const birdnetDir = `${process.cwd()}/..`;
const appContext = AppContextService.createAppContext(birdnetDir);

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  );
  next();
});

registerRoutes(app, appContext);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'birdnet-backend',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐦‍ BirdNET Pi backend running on http://0.0.0.0:${PORT}`);
});

function stopServer() {
  console.log('Shutting down BirdNET backend...');
  appContext.gateway.close();
  process.exit(0);
}

process.on('SIGTERM', stopServer);
process.on('SIGINT', stopServer);
