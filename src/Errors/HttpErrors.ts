import StatusCode from './StatusCodes';

export class RequestError extends Error {
  public statusCode: number;

  constructor(message: string, name: string, statusCode?: any) {
    super(message);
    this.statusCode = statusCode ?? StatusCode.ServerError;
    this.name = name;
    this.message = message;

    Object.setPrototypeOf(this, RequestError.prototype);
  }
}

export class BadRequestError extends RequestError {
  constructor(message?: string) {
    super(message || 'Bad Request Error', 'BadRequest', StatusCode.BadRequest);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class NotFoundError extends RequestError {
  constructor(message?: string) {
    super(message || 'Not Found Error', 'NotFound', StatusCode.NotFound);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends RequestError {
  constructor(message?: string) {
    super(message || 'Unauthorized Error', 'Unauthorized', StatusCode.Unauthorized);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends RequestError {
  constructor(message?: string) {
    super(message || 'Forbidden Error', 'Forbidden', StatusCode.Forbidden);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ConflictError extends RequestError {
  constructor(message?: string) {
    super(message || 'Conflict Error', 'Conflict', StatusCode.Conflict);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
