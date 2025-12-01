import type { AppContext } from '@/services/app-context-service.js';
import type DetectionsService from '@/services/detections-service.js';
import { type Request, type Response } from 'express';

const JWT_SECRET = 'your-secret-key';

export default class DetectionsController {
  private detectionsService: DetectionsService;
  constructor(app: AppContext) {
    this.detectionsService = app.services.detectionService;
  }

  getOverview = (req: Request, res: Response) => {
    const mostRecent = this.detectionsService.getRecentDetections(6);
    const todaysSpecies = this.detectionsService.getSpeciesByDate();
    const stats = this.detectionsService.getStats();
    return res.json({
      todaysSpecies,
      mostRecent,
      stats,
    });
  };

  getRecentDetections = (
    req: Request<unknown, unknown, unknown, { limit: string; page: string }>,
    res: Response,
  ) => {
    const parsed = Number.parseInt(req.query.limit);
    const limit = !Number.isNaN(parsed) && parsed ? parsed : 15;
    const birds = this.detectionsService.getRecentDetections(
      Math.max(1, Math.min(20, limit)),
    );
    return res.json({ birds });
  };

  getDetectionsByDate = (req: Request<{ date: string }>, res: Response) => {
    const date = req.params.date;
    const detections = this.detectionsService.getDetectionsByDay(date);
    return res.json({ detections });
  };

  getDetectionByRecording = (
    req: Request<{ recordingName: string }>,
    res: Response,
  ) => {
    const recordingName = req.params.recordingName;
    const detection = this.detectionsService.getByRecordingName(recordingName);
    return res.json({ detection });
  };

  getDetectionsBySpecies = async (
    req: Request<
      { species: string },
      unknown,
      unknown,
      { limit: string; offset: string }
    >,
    res: Response,
  ) => {
    const speciesStr = req.params.species;
    const s = speciesStr
      .replaceAll('_', ' ')
      .replaceAll('-', ' ')
      .toLowerCase();
    const species = s.charAt(0).toUpperCase() + s.substring(1);

    const parsedLimit = Number.parseInt(req.query.limit);
    const parsedOffset = Number.parseInt(req.query.offset);
    const limit = Number.isNaN(parsedLimit)
      ? 50
      : Math.max(1, Math.min(100, parsedLimit));
    const offset = Number.isNaN(parsedOffset) ? 0 : Math.max(0, parsedOffset);

    const result = this.detectionsService.getDetectionsBySpecies(
      species,
      limit,
      offset,
    );

    return res.json(result);
  };
}
