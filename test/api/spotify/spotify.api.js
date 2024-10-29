const request = require('supertest');
const { JWT_TOKEN } = require('../../mocks');
const { PLAYLIST_SORT } = require('../../../src/Services/Playlist/PlaylistService');

class SpotifyApi {
  constructor(app) {
    this.app = app;
  }

  async createPlaylist(spotifyPlaylistLink) {
    return request(this.app)
      .post('/spotify/playlist')
      .set({ Authorization: JWT_TOKEN })
      .query({ sort: PLAYLIST_SORT.HEAD })
      .send({ link: spotifyPlaylistLink });
  }
}

module.exports.SpotifyApi = SpotifyApi;
