const request = require('supertest');
const { JWT_TOKEN } = require('../../mocks');
const {generateJwtToken} = require('../helpers');

class UserApi {
  constructor(app) {
    this.app = app;
  }

  link({ name, email, sub }) {
    return request(this.app)
      .post('/link')
      .set({ Authorization: JWT_TOKEN })
      .send({ name, email, sub });
  }

  getGetMe(userId) {
    const jwtToken = generateJwtToken(userId);
    return request(this.app)
      .get('/user/getMe')
      .set({ Authorization: jwtToken });
  }

  putGetMe({ first_name, last_name, user_hometown, user_bio, username }) {
    return request(this.app)
      .put('/user/getMe')
      .set({ Authorization: JWT_TOKEN })
      .send({ first_name, last_name, user_hometown, user_bio, username });
  }
}

module.exports.UserApi = UserApi;
