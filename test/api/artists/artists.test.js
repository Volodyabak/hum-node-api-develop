const app = require('../../../src/app');
const { ArtistsApi } = require('./artists.api');
const { ArtistService } = require('../../../src/Services/Artist/ArtistService');

describe('Artists Controller', () => {
  jest.setTimeout(30000);
  const artistApi = new ArtistsApi(app);

  let artist;
  beforeAll(async () => {
    const { artists } = await ArtistService.getArtistList(new Date().toDateString(), 1, 0);
    [artist] = artists;
    if (!artist) {
      throw new Error('Artist table is empty');
    }
  });

  describe('Get artist list', () => {
    it('Should return artist list', async () => {
      const { body, statusCode } = await artistApi.getArtistsList();
      expect(statusCode).toBe(200);
      expect(body.length).toBeGreaterThanOrEqual(0);
      expect(body.length).toBeLessThanOrEqual(250);
      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            artistId: expect.any(Number),
            buzzPoints: expect.any(Number),
            rankChange: expect.any(Number),
            artistName: expect.any(String),
            artistPhoto: expect.any(String),
            newBlurbs: expect.any(Number),
            genreName: expect.any(String),
            spotifyId: expect.any(String),
            category: expect.any(String),
          }),
        ])
      );
    });
  });

  describe('Get artists', () => {
    it('should return artist', async () => {
      const { body, statusCode } = await artistApi.getArtists(10);

      expect(statusCode).toBe(200);
      expect(body.artists.length).toBeLessThanOrEqual(10);
      expect(body).toEqual(
        expect.objectContaining({
          count: expect.any(Number),
          artists: expect.arrayContaining([
            expect.objectContaining({
              artistId: expect.any(Number),
              buzzPoints: expect.any(Number),
              rankChange: expect.any(Number),
              artistName: expect.any(String),
              artistPhoto: expect.any(String),
              newBlurbs: expect.any(Number),
              genreName: expect.any(String),
              spotifyId: expect.any(String),
              category: expect.any(String),
              isFollowed: expect.any(Boolean),
            }),
          ]),
        })
      );
    });
  });

  // describe('Search artist', () => {
  //   it('should find artists', async () => {
  //     const { body, statusCode } = await artistApi.searchArtists({
  //       query: 'B',
  //     });
  //     expect(statusCode).toBe(200);
  //     expect(body).toEqual(
  //       expect.objectContaining({
  //         count: expect.any(Number),
  //         artists: expect.arrayContaining([
  //           expect.objectContaining({
  //             id: expect.any(Number),
  //             name: expect.any(String),
  //             buzzPoints: expect.any(Number),
  //             photo: expect.any(String),
  //             isFollowed: expect.any(Boolean),
  //           }),
  //         ]),
  //       })
  //     );
  //   });
  // });

  describe('Get artist youtube', () => {
    it('should find artist youtube', async () => {
      const { body, statusCode } = await artistApi.getArtistYoutube(artist.artistId);
      expect(statusCode).toBe(200);
      expect(Array.isArray(body.channel)).toBe(true);
      expect(Array.isArray(body.videos)).toBe(true);
      if (body.channel.length) {
        expect(body.channel).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              youtubeSubscribers: expect.any(Number),
              videos: expect.any(Number),
              youtubeBanner: expect.any(String),
              youtubeAvatar: expect.any(String),
              artistId: expect.any(Number),
            }),
          ])
        );
      }
      if (body.videos.length) {
        expect(body.videos).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              videoUrl: expect.any(String),
              videoTitle: expect.any(String),
              videoCreateDate: expect.any(String),
            }),
          ])
        );
      }
    });
  });

  describe('Get artist read', () => {
    it('should find artist read', async () => {
      const { body, statusCode } = await artistApi.getArtistRead(artist.artistId);
      expect(statusCode).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('Get artist blurbs', () => {
    it('should find artist blurbs', async () => {
      const { body, statusCode } = await artistApi.getArtistBlurbs(artist.artistId);
      expect(statusCode).toBe(200);
      expect(Array.isArray(body.releases)).toBe(true);
      if (body.releases.length) {
        expect(body.releases).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              contentId: expect.any(String),
              timeStamp: expect.any(String),
              image: expect.any(String),
              blurb: expect.any(String),
              contentType: expect.any(Number),
              total: expect.any(Number),
            }),
          ])
        );
      }
    });
  });

  describe('Get artist category', () => {
    it('should find artist category', async () => {
      const { body, statusCode } = await artistApi.getArtistCategory(artist.artistId);
      expect(statusCode).toBe(200);
      expect(body).toEqual(
        expect.objectContaining({
          category: expect.any(String),
          artistId: expect.any(Number),
          categoryId: expect.any(Number),
        })
      );
    });
  });

  describe('Get artist buzz chart', () => {
    it('should find artist buzz chart', async () => {
      const { body, statusCode } = await artistApi.getArtistBuzzChart(artist.artistId);
      expect(statusCode).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            buzzPoints: expect.any(Number),
            artistId: expect.any(Number),
            date: expect.any(String),
          }),
        ])
      );
    });
  });

  describe('Get artist release blurbs', () => {
    it('should find artist release blurbs', async () => {
      const { body, statusCode } = await artistApi.getArtistReleaseBlurbs(artist.artistId, {
        limit: 20,
        offset: 0,
      });
      expect(statusCode).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            contentId: expect.any(String),
            timeStamp: expect.any(String),
            image: expect.any(String),
            blurb: expect.any(String),
            contentType: expect.any(Number),
            total: expect.any(Number),
          }),
        ])
      );
    });
  });

  describe('Get artist playlist blurbs', () => {
    it('should find artist playlist blurbs', async () => {
      const artistId = 12407;
      const { body, statusCode } = await artistApi.getArtistPlaylistBlurbs(artistId);
      expect(statusCode).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('Get artist profile', () => {
    it('should find artist profile', async () => {
      const { body, statusCode } = await artistApi.getArtistProfile(artist.artistId);
      expect(statusCode).toBe(200);
      expect(body).toEqual(
        expect.objectContaining({
          id: artist.artistId,
          name: expect.any(String),
          photo: expect.any(String),
          spotifyId: expect.any(String),
          buzzPoints: expect.any(Number),
          rankChange: expect.any(Number),
          genreName: expect.any(String),
          category: expect.any(String),
          isFollowed: expect.any(Number),
        })
      );
      if (body.buzzChart?.length) {
        expect(body.buzzChart).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              buzzPoints: expect.any(Number),
              artistId: expect.any(Number),
              date: expect.any(String),
            }),
          ])
        );
      }
      if (body.brackhits?.length) {
        expect(body.brackhits).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              brackhitId: expect.any(Number),
              name: expect.any(String),
              thumbnail: expect.any(String),
              userStatus: expect.any(String),
            }),
          ])
        );
      }
    });
  });

  describe('Get artist tracks', () => {
    it('should find artist tracks', async () => {
      const { body, statusCode } = await artistApi.getArtistTracks(artist.artistId);
      expect(statusCode).toBe(200);
      expect(Array.isArray(body.tracks)).toBe(true);
      expect(body.artistId).toEqual(expect.any(String));
      expect(body.artistKey).toEqual(expect.any(String));
      if (body.tracks?.length) {
        expect(body.tracks).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              trackKey: expect.any(String),
              trackName: expect.any(String),
              preview: expect.any(String),
              albumImage: expect.any(String),
            }),
          ])
        );
      }
    });
  });

  describe('Get artist', () => {
    it('should find artist', async () => {
      const { body, statusCode } = await artistApi.getArtist(artist.artistId);
      expect(statusCode).toBe(200);
      expect(body).toEqual(
        expect.objectContaining({
          artistId: expect.any(Number),
          artistName: expect.any(String),
          artistPhoto: expect.any(String),
          spotifyId: expect.any(String),
          rankChange: expect.any(Number),
          buzzPoints: expect.any(Number),
          genreName: expect.any(String),
          category: expect.any(String),
          newBlurbs: expect.any(Number),
          isFollowed: expect.any(Number),
        })
      );
    });
  });
});
