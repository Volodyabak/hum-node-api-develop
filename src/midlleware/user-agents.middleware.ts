import { ForbiddenException, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const headlessUserAgents = [/HeadlessChrome/, /PhantomJS/, /Puppeteer/, /Node.js/];

export class UserAgentsMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.get('User-Agent') || '';

    if (headlessUserAgents.some((ua) => ua.test(userAgent))) {
      throw new ForbiddenException();
    }

    next();
  }
}
