const request = require('supertest');
const { JWT_TOKEN } = require('../../mocks');

class ArtistsApi {
  constructor(app) {
    this.app = app;
  }

  async getArtistsList() {
    return request(this.app)
      .get('/artistList')
      .query({ date: new Date().toISOString() });
  }

  async getArtists(take) {
    return request(this.app)
      .get('/artist')
      .set({ Authorization: JWT_TOKEN })
      .query({ date: new Date().toISOString(), take });
  }

  async searchArtists({ query, genreId, category, following, take }) {
    return request(this.app)
      .get('/artist/search')
      .set({ Authorization: JWT_TOKEN })
      .query({ query, genreId, category, following, take });
  }

  getArtistYoutube(artistId) {
    return request(this.app).get(`/youtube/${artistId}`);
  }

  getArtistRead(artistId) {
    return request(this.app).get(`/artistRead/${artistId}`);
  }

  getArtistBlurbs(artistId) {
    return request(this.app).get(`/artist/blurbs/${artistId}`);
  }

  getArtistCategory(artistId) {
    return request(this.app).get(`/artist/category/${artistId}`);
  }

  getArtistBuzzChart(artistId) {
    return request(this.app).get(`/artist/buzzChart/${artistId}`);
  }

  getArtistReleaseBlurbs(artistId, { limit, offset }) {
    return request(this.app)
      .get(`/artist/releaseBlurbs/${artistId}`)
      .query({ limit, offset });
  }

  getArtistPlaylistBlurbs(artistId) {
    return request(this.app).get(`/artist/playlistBlurbs/${artistId}`);
  }

  getArtistProfile(artistId) {
    return request(this.app)
      .get(`/artist/${artistId}/profile`)
      .set({ Authorization: JWT_TOKEN })
      .query({ date: new Date().toISOString() });
  }

  getArtistTracks(artistId) {
    return request(this.app)
      .get(`/artist/${artistId}/tracks`)
      .set({ Authorization: JWT_TOKEN });
  }

  getArtist(artistId) {
    return request(this.app)
      .get(`/artist/${artistId}`)
      .set({ Authorization: JWT_TOKEN })
      .query({ date: new Date().toISOString() });
  }
}

module.exports.ArtistsApi = ArtistsApi;
