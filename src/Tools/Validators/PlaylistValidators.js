const { body } = require('express-validator');

module.exports.createPlaylistValidators = [body('link').notEmpty().withMessage('link is required')];
