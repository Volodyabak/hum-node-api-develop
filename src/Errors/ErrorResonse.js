module.exports.sendErrors = (res, status, messages) => {
  let errors;
  if (Array.isArray(messages)) {
    errors = messages.map((message) => ({ message }));
  } else {
    errors = [{ message: messages }];
  }
  return res.status(status).send({ errors });
}; //trigger
