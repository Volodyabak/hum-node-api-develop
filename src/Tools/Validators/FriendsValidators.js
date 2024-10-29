const { body, query } = require('express-validator');

module.exports.postFriendRequestValidators = [
  body('userRequestedId').isUUID('4').withMessage('userRequestedId field is required and should be in UUIDv4 format'),
]; //trigger

module.exports.postFriendRespondRequestValidators = [
  body('userRequestedId').isUUID('4').withMessage('userRequestedId field is required and should be in UUIDv4 format'),
  body('accept').isBoolean().withMessage('accept field is required and must be boolean'),
];
