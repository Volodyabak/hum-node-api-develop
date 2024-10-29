import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Environment } from '../constants';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    // if (process.env.NODE_ENV === Environment.PROD) {
    //   const { method, path: url } = request;
    //
    //   this.logger.log(`START::: ${method} ${url}`);
    //
    //   response.on('finish', () => {
    //     const { statusCode } = response;
    //
    //     this.logger.log(`END::: ${method} ${url} ${statusCode}`);
    //   });
    // }

    next();
  }
}
