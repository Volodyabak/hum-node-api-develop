import {
  GET_ALL_ARTISTS,
  GET_ARTIST_BY_SPOTIFY_KEY,
  GET_ARTIST_CHANNEL,
  GET_ARTIST_NEWS,
  GET_ARTIST_PROFILE,
  GET_ARTIST_TRACK_KEY,
  GET_ARTIST_TWEETS,
  GET_ARTISTS_COUNT,
  GET_TOP_ARTISTS_BY_DAILY_SCORE,
  INSERT_OR_UPDATE_ARTIST_FROM_SPOTIFY,
} from '../../Queries';
import Tools from '../../Tools';
import { db } from '../../../database/knex';
import { GET_ARTIST_YOUTUBE_VIDEOS } from 'src/Queries/ArtistQueries';

class ArtistService {
  async getArtistProfile(artistId, userId = null) {
    const [artist] = await Tools.promisifiedQuery(
      GET_ARTIST_PROFILE,
      {
        artistId,
      },
      'ArtistService getArtistProfile() GET_ARTIST_PROFILE Error: ',
    );

    if (userId) {
      artist.isFollowed = await this.isUserFollowingArtist(userId, artistId);
    }

    return artist;
  }

  async isUserFollowingArtist(userId, artistId) {
    const followedArtist = await db('labl.user_feed_preferences')
      .where({
        artistId,
        userId,
      })
      .first();

    return followedArtist ? 1 : 0;
  }

  async getTopArtistsByDailyScore(take = 3) {
    return Tools.promisifiedQuery(
      GET_TOP_ARTISTS_BY_DAILY_SCORE,
      {
        take,
      },
      'Artist Service getTopArtistsByDailyScore() GET_TOP_ARTISTS_BY_DAILY_SCORE Error: ',
    );
  }

  async getArtistList(localDate, take, skip) {
    const [artists, [{ count }]] = await Promise.all([
      Tools.promisifiedQuery(GET_ALL_ARTISTS, {
        localDate,
        take,
        skip,
      }),
      Tools.promisifiedQuery(GET_ARTISTS_COUNT),
    ]);
    return {
      count,
      artists,
    };
  }

  async getArtistTrackKey(brackhitId, artistId) {
    const [result] = await Tools.promisifiedQuery(
      GET_ARTIST_TRACK_KEY,
      {
        brackhitId,
        artistId,
      },
      'Artist Service getArtistTrackKey() GET_ARTISTS_BY_MASTER_GENRE Error: ',
    );

    return result?.trackId;
  }

  async getArtistBySpotifyKey(artistKey) {
    const [artist] = await Tools.promisifiedQuery(
      GET_ARTIST_BY_SPOTIFY_KEY,
      {
        artistKey,
      },
      'Artist Service getArtistBySpotifyKey() GET_ARTIST_BY_SPOTIFY_KEY Error: ',
    );
    return artist;
  }

  async getInsertedOrUpdatedArtistFromSpotify(spotifyArtist) {
    await Tools.promisifiedQuery(
      INSERT_OR_UPDATE_ARTIST_FROM_SPOTIFY,
      {
        artistName: spotifyArtist.name,
        artistKey: spotifyArtist.id,
      },
      'ArtistService insertOrUpdateArtistFromSpotify() INSERT_OR_UPDATE_ARTIST_FROM_SPOTIFY Error: ',
    );

    return this.getArtistBySpotifyKey(spotifyArtist.id);
  }

  async getArtistChannel(artistId) {
    return Tools.promisifiedQuery(GET_ARTIST_CHANNEL, { artistId }, 'Get artist channel error: ');
  }

  async getArtistsVideos(artistId, take, skip) {
    return Tools.promisifiedQuery(GET_ARTIST_YOUTUBE_VIDEOS, { artistId, take, skip }, 'Get artist videos error: ');
  }

  async getArtistTweets(artistId) {
    return Tools.promisifiedQuery(
      GET_ARTIST_TWEETS,
      { artist_id: artistId },
      'ArtistService getArtistTweets() GET_ARTIST_TWEETS error: ',
    );
  }

  async getArtistNews(artistId) {
    return Tools.promisifiedQuery(
      GET_ARTIST_NEWS,
      { artistId },
      'ArtistService getArtistNews() GET_ARTIST_NEWS error: ',
    );
  }
}

const instance = new ArtistService();
export { instance as ArtistService };
