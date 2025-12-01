import { type Response, type Request } from 'express';
import type { AppContext } from '@/services/app-context-service.js';
import type ConfigService from '@/services/config-service.js';

export default class ConfigController {
  private config: ConfigService;
  constructor(context: AppContext) {
    this.config = context.services.configService;
  }

  getConfig = (req: Request, res: Response) => {
    return res.json({
      siteName: this.config.current.SITE_NAME,
    });
  };
}
