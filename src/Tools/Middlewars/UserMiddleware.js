const Tools = require('../../Tools');
const { UserService } = require('../../Services/User/UserService');
const { BadRequestError } = require('../../Errors');

module.exports.validateUserProfile = async (req, res, next) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);

  const profile = await UserService.getUserProfile(userId);
  if (!profile) {
    throw new BadRequestError(`User profile is missing for userId=${userId}`);
  }

  next();
};
