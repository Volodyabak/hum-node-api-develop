import Tools from '../Tools';
import { SpotifyService } from '../Services/Spotify/SpotifyService';
import { FeedService } from '../Services/Feed/FeedService';
import { SpotifyClient, TimeRange } from '../Services/Spotify/SpotifyClient';
import { uniqBy } from 'lodash';
import { ConstantsModel } from '../../database/Models/ConstantsModel';
import { ConstantId } from '../modules/constants/constants';

export const firstTimeTopArtists = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const { accessToken } = req.query;

  let artistsCount: number = await FeedService.getUserArtistsCount(userId);
  const updateUserFeed: boolean = artistsCount === 0;
  const [artistsLimitConst, artistCountConst] = await Promise.all([
    ConstantsModel.query().findById(ConstantId.CONNECT_SPOTIFY_TOP_ARTISTS_COUNT),
    ConstantsModel.query().findById(ConstantId.CONNECT_SPOTIFY_FEED_ARTISTS_COUNT),
  ]);

  const [mediumTermTopArtists, longTermTopArtists] = await Promise.all([
    SpotifyClient.getMyTopArtists(accessToken, TimeRange.MEDIUM_TERM, artistsLimitConst.value),
    SpotifyClient.getMyTopArtists(accessToken, TimeRange.LONG_TERM, artistsLimitConst.value),
  ]);

  const spotifyArtists: SpotifyApi.ArtistObjectFull[] = uniqBy(
    [...mediumTermTopArtists.items, ...longTermTopArtists.items],
    'id',
  );

  await SpotifyService.storeUserTopSpotifyArtists(spotifyArtists, userId, updateUserFeed);

  artistsCount = await FeedService.getUserArtistsCount(userId);

  const shortTermTopArtists =
    artistsCount > artistCountConst.value
      ? await SpotifyClient.getMyTopArtists(accessToken, TimeRange.SHORT_TERM, 5)
      : await SpotifyClient.getMyTopArtists(
          accessToken,
          TimeRange.SHORT_TERM,
          artistsLimitConst.value,
        );

  await SpotifyService.storeUserTopSpotifyArtists(
    shortTermTopArtists.items,
    userId,
    updateUserFeed,
  );

  artistsCount = await FeedService.getUserArtistsCount(userId);
  if (artistsCount < artistCountConst.value) {
    const followedArtists = await SpotifyClient.getFollowedArtists(accessToken, 20);
    await SpotifyService.storeUserTopSpotifyArtists(
      followedArtists.artists.items,
      userId,
      updateUserFeed,
    );
  }

  res.sendStatus(200);
};
