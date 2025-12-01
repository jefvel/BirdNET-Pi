import type { AppContext } from '@/services/app-context-service.js';
import type BirdService from '@/services/bird-service.js';
import { type Request, type Response } from 'express';

export default class BirdController {
  private birdService: BirdService;
  constructor(context: AppContext) {
    this.birdService = context.services.birdService;
  }

  getBirds = async (req: Request, res: Response) => {
    const birds = await this.birdService.getBirds();
    return res.json({ birds });
  };
}
