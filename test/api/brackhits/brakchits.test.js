const app = require('../../../src/app');
const { BrackhitsApi } = require('./brackhits.api');
const { SpotifyApi } = require('../spotify/spotify.api');
const { SPOTIFY_PLAYLIST_LINK } = require('../../mocks');

describe('Brackhits Controller', () => {
  jest.setTimeout(20000);
  const brackhitsApi = new BrackhitsApi(app);
  const spotifyApi = new SpotifyApi(app);

  const brackhitData = {
    name: 'Test Brackhit 1',
    description: 'Test brackhit description',
    duration: 48,
  };

  describe('Get brackhit', () => {
    let initialBrackhit;
    beforeAll(async () => {
      const spotifyResponse = await spotifyApi.createPlaylist(SPOTIFY_PLAYLIST_LINK);
      const brackhitResponse = await brackhitsApi.createBrackhit({
        name: brackhitData.name,
        description: brackhitData.description,
        duration: brackhitData.duration,
        playlistKey: spotifyResponse.body.playlist.playlistKey,
        tracks: spotifyResponse.body.tracks,
      });
      initialBrackhit = brackhitResponse.body;
    });

    it('should find brackhit', async () => {
      const { body, statusCode } = await brackhitsApi.getBrackhit(initialBrackhit.brackhitId);
      expect(statusCode).toBe(200);
      expect(body).toEqual(
        expect.objectContaining({
          brackhitId: initialBrackhit.brackhitId,
          name: initialBrackhit.name,
          description: initialBrackhit.description,
          ownerId: initialBrackhit.ownerId,
          duration: initialBrackhit.duration,
          timeLive: initialBrackhit.timeLive,
          size: initialBrackhit.size,
          scoringState: initialBrackhit.scoringState,
          choices: initialBrackhit.choices,
        })
      );
    });

    it('should fail if brackhit does not exist', async () => {});

    afterAll(async () => {
      await brackhitsApi.deleteBrackhit(initialBrackhit.brackhitId);
    });
  });
});
