import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

export class AppleUserTokensModel extends Model {
  @ApiProperty()
  userId: string;
  @ApiProperty()
  musicUserToken: string;
  @ApiProperty()
  exp: number;
  @ApiProperty()
  dateInserted: Date;
  @ApiProperty()
  updatedAt: Date;

  static get tableName() {
    return 'ean_collection.apple_user_tokens';
  }

  static get idColumn() {
    return 'userId';
  }
}
