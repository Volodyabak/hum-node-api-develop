function

exports.timestamp = (req, context, events, next) => {
  context.vars.timestamp = new Date().toISOString();
  return next();
};
