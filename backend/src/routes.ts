import AuthController from './controllers/auth-controller.js';
import BirdController from './controllers/bird-controller.js';
import ConfigController from './controllers/config-controller.js';
import DetectionsController from './controllers/detections-controller.js';
import type { AppContext } from './services/app-context-service.js';
import { type Express } from 'express';

const registerRoutes = (router: Express, app: AppContext) => {
  const authController = new AuthController(app);
  const birdController = new BirdController(app);
  const detectionsController = new DetectionsController(app);
  const configController = new ConfigController(app);

  router.get('/api/config', configController.getConfig);

  router.get('/api/birds', birdController.getBirds);

  router.get('/api/overview', detectionsController.getOverview);

  router.get(
    '/api/detections/recent',
    detectionsController.getRecentDetections,
  );
  router.get(
    '/api/detections/recording/:recordingName',
    detectionsController.getDetectionByRecording,
  );
  router.get(
    '/api/detections/date/:date',
    detectionsController.getDetectionsByDate,
  );
  router.get(
    '/api/detections/species/:species',
    detectionsController.getDetectionsBySpecies,
  );

  router.get('/api/auth/verify', authController.verifySession);
  router.post('/api/auth/login', authController.login);
};

export default registerRoutes;
