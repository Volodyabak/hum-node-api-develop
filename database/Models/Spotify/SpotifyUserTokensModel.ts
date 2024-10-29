import { Model } from 'objection';

export class SpotifyUserTokensModel extends Model {
  userId: string;
  refreshToken: Buffer;
  accessToken: Buffer;
  spotifyUserId: string;
  expireTime: number;
  accountType: string;
  lastUpdated: Date;
  dateInserted: Date;
  lastChecked: Date;

  static get tableName() {
    return 'ean_collection.spotify_user_tokens';
  }

  static get idColumn() {
    return 'userId';
  }

  static get relationMappings() {
    return {};
  }

  static get rawSql() {
    return {
      aesDecryptAccessToken(key: string) {
        return `aes_decrypt(access_token, unhex(${key})) as accessToken`;
      },
      aesDecryptRefreshToken(key: string) {
        return `aes_decrypt(refresh_token, unhex(${key})) as refreshToken`;
      },
    };
  }
}
