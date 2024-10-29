const { sign } = require('jsonwebtoken');

const TEST_JWT_SECRET = 'A62B6E87AFB3BFE52D5A962C999D6B3569A937743CE7111EEE6E346F7C21E421';

module.exports.generateJwtToken = (userId) => {
  return sign({ sub: userId }, TEST_JWT_SECRET);
};
