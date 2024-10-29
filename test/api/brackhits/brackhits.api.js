const request = require('supertest');
const { JWT_TOKEN } = require('../../mocks');

class BrackhitsApi {
  constructor(app) {
    this.app = app;
  }

  async getBrackhit(brackhitId) {
    return request(this.app)
      .get(`/brackhits/${brackhitId}`)
      .set({ Authorization: JWT_TOKEN })
      .query({ date: new Date().toISOString() });
  }

  async createBrackhit({ name, playlistKey, description, duration, tracks, thumbnail }) {
    return request(this.app)
      .post('/brackhits')
      .set({ Authorization: JWT_TOKEN })
      .send({ name, playlistKey, description, duration, tracks, thumbnail });
  }

  async deleteBrackhit(brackhitId) {
    return request(this.app)
      .delete(`/brackhits/${brackhitId}`)
      .set({ Authorization: JWT_TOKEN });
  }
}

module.exports.BrackhitsApi = BrackhitsApi;
