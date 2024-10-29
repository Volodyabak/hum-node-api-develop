const CognitoExpress = require('cognito-express');
const { sendErrors } = require('../Errors/ErrorResonse');
const { UnauthorizedError } = require('../Errors');

const cognitoExpress = new CognitoExpress({
  region: process.env.AWS_REGION,
  cognitoUserPoolId: process.env.COGNITO_MY_ARTISTORY_POOL,
  tokenUse: 'id',
});

exports.authMiddleware = (req, res, next) => {
  try {
    const authorization = req.headers.authorization.split(' ')[1];
    const tokenParts = authorization.split(' ');
    let token = '';
    if (tokenParts.length === 2) {
      token = tokenParts[1];
    } else if (tokenParts.length === 1) {
      token = tokenParts[0];
    } else {
      throw new UnauthorizedError();
    }

    cognitoExpress.validate(token, (err, response) => {
      if (err) {
        console.log('Error', err);
        res.status(401).send(err);
      } else {
        req.userId = response.sub;
        req.roles = response['cognito:groups'] || [];
        next();
      }
    });
  } catch (err) {
    console.log('AuthMiddleware Error:', err);
    sendErrors(res, 401, 'Token was not provided');
  }
};
