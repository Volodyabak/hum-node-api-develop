const { ForbiddenError } = require('../Errors');

module.exports.ROLES = {
  Admin: 'admin',
};

module.exports.rolesMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.roles || req.roles.length === 0) {
      throw new ForbiddenError('User does not have any roles');
    }
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    rolesArray.forEach((role) => {
      if (!req.roles.includes(role)) {
        throw new ForbiddenError(`User does not have ${role} role`);
      }
    });
    next();
  };
};
