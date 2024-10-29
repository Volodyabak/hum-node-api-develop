import {
  GET_USER_ARTISTS_COUNT,
  INSERT_OR_UPDATE_USER_ARTIST_FEED_PREFERENCE,
  REMOVE_USER_FEED_ARTIST,
} from '../../Queries';
import Tools from '../../Tools';

class FeedService {
  // artistFeed = { artistId: number, video: boolean, twitter: boolean, news: boolean }
  async insertOrUpdateUserArtistFeedPreference(userId: string, artistFeed: any): Promise<any> {
    return Tools.promisifiedQuery(
      INSERT_OR_UPDATE_USER_ARTIST_FEED_PREFERENCE,
      {
        userId,
        artistId: artistFeed.artistId,
        videoFlag: artistFeed.video,
        tweetFlag: artistFeed.tweet,
        newsFlag: artistFeed.news,
      },
      `FeedService insertOrUpdateUserArtistFeedPreference() with artistId ${artistFeed.artistId} error: `,
    );
  }

  async setUserArtistFeedPreferencesArray(userId: string, artistIds: number[]) {
    return Promise.all(
      artistIds.map((id) => {
        return this.insertOrUpdateUserArtistFeedPreference(userId, {
          artistId: id,
          video: true,
          tweet: true,
          news: true,
        });
      }),
    );
  }

  async getUserArtistsCount(userId: string): Promise<number> {
    const [result] = await Tools.promisifiedQuery(
      GET_USER_ARTISTS_COUNT,
      {
        userId,
      },
      'FeedService getUserArtistsCount() GET_USER_ARTISTS_COUNT error: ',
    );
    return result.count;
  }

  async removeUserFeedArtist(userId: string, artistId: number): Promise<any> {
    return Tools.promisifiedQuery(
      REMOVE_USER_FEED_ARTIST,
      {
        userId,
        artistId,
      },
      'FeedService removeUserFeedArtist() REMOVE_USER_FEED_ARTIST error: ',
    );
  }
}

const instance = new FeedService();
export { instance as FeedService };
