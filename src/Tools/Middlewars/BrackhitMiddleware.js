const Tools = require('../../Tools');
const { UserService } = require('../../Services/User/UserService');
const { BrackhitsServiceExpress } = require('../../Services/Brackhits/BrackhitsServiceExpress');

module.exports.validateBrackhitSubmission = async (req, res, next) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const brackhitId = +req.params.brackhitId;

  try {
    const [brackhit, userBrackhit] = await Promise.all([
      BrackhitsServiceExpress.getBrackhit(brackhitId),
      UserService.getUserBrackhit(userId, brackhitId),
    ]);

    if (brackhit === null) {
      return sendError(res, userId, brackhitId, 'the brackhitId does not exist');
    }
    if (!userBrackhit) {
      return sendError(res, userId, brackhitId, 'the user did not start the brackhit');
    }
    if (userBrackhit.isComplete) {
      return sendError(res, userId, brackhitId, 'the brackhit is already completed');
    }

    next();
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const sendError = (res, userId, brackhitId, message) => {
  return res.status(400).send({
    err: message,
  });
};
