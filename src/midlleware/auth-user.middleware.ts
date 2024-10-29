import { ForbiddenException, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ErrorConst } from '../constants';
import jwt from 'jsonwebtoken';

export class AuthUserMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = this.getApiKey(req);

    if (apiKey) {
      this.handleApiKeyAuth(apiKey, req, res, next);
    } else {
      await this.handleJwtAuth(req, res, next);
    }
  }

  private getApiKey(req: Request): string | null {
    const apiKeyFromHeader = req.headers['x-api-key'] as string;
    const apiKeyFromQuery = req.query.api_key as string;
    return apiKeyFromHeader || apiKeyFromQuery || null;
  }

  private getJwtToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    return authHeader?.replace(/^Bearer /, '') || null;
  }

  private isValidApiKey(apiKey: string): boolean {
    return apiKey === process.env.API_KEY;
  }

  private handleApiKeyAuth(apiKey: string, req: Request, res: Response, next: NextFunction) {
    if (!this.isValidApiKey(apiKey)) {
      console.log(`Invalid API key for endpoint: ${req.originalUrl}`);
      throw new ForbiddenException(ErrorConst.INVALID_API_KEY);
    }

    // todo: add user id to res.locals
    // res.locals = { apiKey, userId: 'apiKeyUser' };

    next();
  }

  private async handleJwtAuth(req: Request, res: Response, next: NextFunction) {
    const token = this.getJwtToken(req);

    if (!token) {
      console.log(`No auth token or API key for endpoint: ${req.originalUrl}`);
      throw new ForbiddenException(ErrorConst.NO_AUTH_TOKEN);
    }

    // todo: add token validation
    const payload = jwt.decode(token);

    res.locals = {
      userId: payload.sub,
      accessToken: token,
    };

    next();
  }
}
