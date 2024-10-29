const StatusCode = require('../Errors/StatusCodes');
const { Logger } = require('@nestjs/common');

const logger = new Logger('ErrorHandlerMiddleware');

module.exports.ErrorHandlerMiddleware = async (err, req, res) => {
  const errorResult = {
    error: err.message,
    code: err.statusCode ?? StatusCode.ServerError,
    name: err.name,
    errorData: err.errorData ?? err.data,
  };

  logger.error(JSON.stringify(errorResult, null, 2));

  if (res.headersSent) {
    return res.end();
  }

  return res.status(errorResult.code).json(errorResult).end();
};
