const logger = require('../utils/logger');

const loggerMiddleware = (req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body,
  });

  res.on('finish', () => {
    logger.info(`Response: ${res.statusCode} ${req.method} ${req.url}`);
  });

  next();
};

module.exports = loggerMiddleware;