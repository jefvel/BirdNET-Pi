import type { AppContext } from '@/services/app-context-service.js';
import type ConfigService from '@/services/config-service.js';
import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key';

export default class AuthController {
  private config: ConfigService;
  constructor(context: AppContext) {
    this.config = context.services.configService;
  }

  getRequestToken = (req: Request) => {
    const authHeader = req.cookies.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
      return decoded;
    } catch (error) {
      return null;
    }
  };

  verifySession = (req: Request, res: Response) => {
    const token = this.getRequestToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return res.json(token);
  };

  login = (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (username === 'birdnet' && password === this.config.current.CADDY_PWD) {
      const token = jwt.sign({ username }, JWT_SECRET);

      res.cookie('authorization', token, {
        httpOnly: true,
      });

      res.json({
        token,
        user: { username },
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  };
}
