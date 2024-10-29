import { ArtistService } from '../Artist/ArtistService';
import { FeedService } from '../Feed/FeedService';
import { SpotifyArtistModel } from "../../../database/Models";
import { SpotifyArtistUserModel } from "../../../database/Models";

class SpotifyService {
  constructor() {}

  async storeUserTopSpotifyArtists(
    artistObjects: SpotifyApi.ArtistObjectFull[],
    userId: string,
    updateUserFeed: boolean = true
  ): Promise<void> {
    await Promise.all(
      artistObjects.map(async (artistObj) => {
        const spotifyArtist = await this.getCreatedOrUpdatedSpotifyArtist(artistObj);
        const promises = [this.insertUserSpotifyArtist(userId, spotifyArtist.id)];
        if (updateUserFeed) {
          const artistFeed = { artistId: spotifyArtist.artistId, video: true, tweet: true, news: true };
          promises.push(FeedService.insertOrUpdateUserArtistFeedPreference(userId, artistFeed));
        }
        await Promise.all(promises);
      })
    );
  }

  // Returns spotify artist if present, otherwise creates new spotifyArtist if one is missing.
  // Creates new artist in ean_collection.artist if one is missing or updates spotifyArtistKey column.
  // Updates artistId column inside ean_collection.spotify_artist and then returns spotify artist
  async getCreatedOrUpdatedSpotifyArtist(spotifyArtist: SpotifyApi.ArtistObjectFull): Promise<SpotifyArtistModel> {
    const insertedArtist = await this.insertSpotifyArtist(spotifyArtist);

    if (!insertedArtist.artistId) {
      // map spotify artist to corresponding artist from ean_collection.artist
      const artist = await ArtistService.getInsertedOrUpdatedArtistFromSpotify(spotifyArtist);
      await this.updateSpotifyArtist(spotifyArtist, artist.id);
    } else {
      await this.updateSpotifyArtistName(spotifyArtist);
    }

    return this.getSpotifyArtist(spotifyArtist.id);
  }

  async insertUserSpotifyArtist(userId: string, spotifyArtistId: number): Promise<SpotifyArtistUserModel> {
    return SpotifyArtistUserModel.query()
      .insertAndFetch({
        userId,
        spotifyArtistId,
      })
      .onConflict()
      .ignore();
  }

  async insertSpotifyArtist(spotifyArtist: SpotifyApi.ArtistObjectFull): Promise<SpotifyArtistModel> {
    return SpotifyArtistModel.query()
      .insertAndFetch({
        artistKey: spotifyArtist.id,
        artistName: spotifyArtist.name,
      })
      .onConflict()
      .ignore();
  }

  async updateSpotifyArtist(spotifyArtist: SpotifyApi.ArtistObjectFull, artistId: number): Promise<void> {
    await SpotifyArtistModel.query()
      .update({
        artistId,
        artistName: spotifyArtist.name,
      })
      .where('artist_key', spotifyArtist.id);
  }

  async updateSpotifyArtistName(spotifyArtist: SpotifyApi.ArtistObjectFull): Promise<void> {
    await SpotifyArtistModel.query()
      .update({
        artistName: spotifyArtist.name,
      })
      .where('artist_key', spotifyArtist.id);
  }

  async getSpotifyArtist(artistKey: string): Promise<SpotifyArtistModel> {
    return SpotifyArtistModel.query().findOne({ artistKey });
  }
}

const SpotifyServiceInstance = new SpotifyService();

export { SpotifyServiceInstance as SpotifyService };
