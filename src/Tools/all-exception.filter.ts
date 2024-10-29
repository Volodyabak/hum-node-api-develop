import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getResponse<Request>();

    const status = exception.response?.statusCode || exception.code || exception.statusCode || 500;
    const error = exception.response?.message || exception.message;

    console.log(exception);

    return res.status(status).send({ code: status, name: exception.name, error });
  }
}
