import { Injectable, Logger } from '@nestjs/common';
import { uniqBy } from 'lodash';

import { AppleUserTokensModel } from '../../../../database/Models/apple/apple-user-tokens.model';
import { BadRequestError, NotFoundError } from '../../../Errors';
import { DAY, ErrorConst } from '../../../constants';
import { MusicKitService } from './music-kit.service';
import { AppleTrackModel, UserFeedPreferencesModel } from '../../../../database/Models';
import { RepositoryService } from '../../repository/services/repository.service';

const MUSIC_USER_TOKEN_EXPIRATION = 150 * DAY;

@Injectable()
export class AppleMusicService {
  private readonly logger = new Logger(AppleMusicService.name);

  constructor(
    private readonly musicKitService: MusicKitService,
    private readonly repository: RepositoryService,
  ) {}

  async saveMusicUserToken(userId: string, musicUserToken: string): Promise<AppleUserTokensModel> {
    try {
      const token = await this.repository.appleMusic.getAppleMusicUserToken(userId);

      if (token) {
        return await this.repository.appleMusic.updateAppleMusicUserToken(userId, {
          musicUserToken,
          exp: Date.now() + MUSIC_USER_TOKEN_EXPIRATION,
        });
      }

      return await this.repository.appleMusic.saveAppleMusicUserToken({
        userId,
        musicUserToken,
        exp: Date.now() + MUSIC_USER_TOKEN_EXPIRATION,
      });
    } catch (err) {
      this.logger.error(err);
      throw new Error(ErrorConst.FAILED_TO_SAVE_MUSIC_USER_TOKEN);
    }
  }

  async getMusicUserToken(userId: string) {
    const userToken = await this.repository.appleMusic.getAppleMusicUserToken(userId);

    if (!userToken) {
      throw new NotFoundError(ErrorConst.MUSIC_USER_TOKEN_NOT_FOUND);
    }

    if (userToken.exp < Date.now()) {
      throw new BadRequestError(ErrorConst.MUSIC_USER_TOKEN_EXPIRED);
    }

    return userToken;
  }

  async updateUserPreferences(userId: string): Promise<UserFeedPreferencesModel[]> {
    const token = await this.getMusicUserToken(userId);
    this.musicKitService.setMusicUserToken(token.musicUserToken);

    const tracks = await this.musicKitService.getRecentlyPlayedTracks();
    const trackIds = tracks.map((track) => track.id);

    const existingArtists = await AppleTrackModel.query()
      .alias('a_track')
      .select('a_artist.artistId', 'a_artist.artistName')
      .whereIn('track_key', trackIds)
      .leftJoin('ean_collection.apple_album_track as aat', 'a_track.id', 'aat.apple_track_id')
      .leftJoin('ean_collection.apple_artist as a_artist', 'aat.apple_artist_id', 'a_artist.id')
      .castTo<{ artistId: number }[]>();

    const uniqueArtists = uniqBy(existingArtists, 'artistId');

    return Promise.all(
      uniqueArtists.map(async (artist) => {
        return UserFeedPreferencesModel.query()
          .insertAndFetch({
            userId,
            artistId: artist.artistId,
          })
          .onConflict()
          .ignore();
      }),
    );
  }
}
