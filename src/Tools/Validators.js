const { validationResult, query, body } = require('express-validator'); //trigger

module.exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

module.exports.userPutGetMeValidators = [
  body('first_name').optional(),
  body('last_name')
    .optional()
    .isLength({ min: 1 })
    .withMessage('lastName must be at least 1 characters long'),
  body('user_hometown')
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage('userHometown must be at least 1 and at most 30 characters'),
  body('user_bio')
    .optional()
    .isLength({ max: 150 })
    .withMessage('userBio must be no more than 150 characters'),
  body('username')
    .optional()
    .isLength({ min: 4, max: 35 })
    .withMessage('username must be at least 4 and at most 35 characters')
    .matches(/^[a-zA-Z0-9\-_]+$/)
    .withMessage(
      'username can only contain lowercase or uppercase letters, numbers, dashes or underscores',
    ),
];

module.exports.queryParamsGetUserBrackhitsValidators = [
  query('completed')
    .optional()
    .custom((value) => +value === 0 || +value === 1)
    .withMessage('Query param "completed" must be either 0 or 1'),
];

module.exports.isDateQueryParamValid = [
  query('date')
    .exists()
    .withMessage('Missing query param "date"')
    .bail()
    .isISO8601()
    .toDate()
    .withMessage('Query param "date" value is invalid'),
];

module.exports.queryParamsGetSearchBrackhits = [
  query('query').exists().withMessage('Missing query param "query"'),
  query('skip')
    .optional()
    .custom((value) => +value >= 0)
    .withMessage('Query param "skip" must be greater or equal to 0'),
  query('take')
    .optional()
    .custom((value) => +value >= 0)
    .withMessage('Query param "take" must be greater or equal to 0'),
];

module.exports.isFollowingParamValid = [
  query('following')
    .optional()
    .custom((value) => value === '0' || value === '1')
    .withMessage('Query param "following" must be either 1 or 0'),
];
