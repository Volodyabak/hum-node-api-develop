import { SpotifyUserTokensModel } from '../../../../database/Models/Spotify/SpotifyUserTokensModel';
import {
  SpotifyPlaylistsValidationParams,
  SpotifyUserAccessData,
} from '../interfaces/spotify-user.interface';
import { SpotifyPlaylistValidation } from '../interfaces/spotify.interfaces';
import { GetUserSpotifyPlaylistsQueryDto } from '../../users/dto/users-api.dto';
import {
  SPOTIFY_OWNER,
  SpotifyAccountType,
  SpotifyKeywords,
  SpotifyPlaylistValidationMessage,
} from '../constants';

export class SpotifyUtils {
  // Checks whether Spotify playlist is allowed for brackhit creation.
  // If not allowed, then returning object will contain an error message
  static isPlaylistAllowedForBrackhitCreation(
    el: SpotifyApi.PlaylistObjectSimplified,
    params: SpotifyPlaylistsValidationParams,
  ): SpotifyPlaylistValidation {
    const message = this.getPlaylistErrorMessage(el, params);
    return {
      isAllowed: message ? 0 : 1,
      message,
    };
  }

  // Returns a message, if playlist is not allowed for brackhit creation
  static getPlaylistErrorMessage(
    el: SpotifyApi.PlaylistObjectSimplified,
    params: SpotifyPlaylistsValidationParams,
  ): SpotifyPlaylistValidationMessage | undefined {
    if (el.tracks.total < params.size) {
      return SpotifyPlaylistValidationMessage.NOT_ENOUGH_TRACKS;
    }
    if (el.name.includes(SpotifyKeywords.YOUR_TOP_SONGS) && el.owner.id === SPOTIFY_OWNER) {
      return SpotifyPlaylistValidationMessage.WRAPPED_PLAYLIST_NOT_ALLOWED;
    }

    return undefined;
  }

  static getPlaylistsValidationParams(
    accessData: SpotifyUserAccessData,
    query: GetUserSpotifyPlaylistsQueryDto,
  ): SpotifyPlaylistsValidationParams {
    return {
      spotifyUserId: accessData.spotifyUserId,
      size: query.size,
    };
  }

  static getUserSpotifyServiceStatus(spotifyToken: SpotifyUserTokensModel) {
    const accountType = spotifyToken?.accountType;

    if (accountType === SpotifyAccountType.PREMIUM) {
      return SpotifyAccountType.PREMIUM;
    } else if (accountType === SpotifyAccountType.FREE || accountType === SpotifyAccountType.OPEN) {
      return SpotifyAccountType.FREE;
    } else {
      return null;
    }
  }
}
