import { Model } from 'objection';
import { UserProfileInfoModel } from './UserProfileInfoModel';
import { ApiProperty } from '@nestjs/swagger';
import { EMAIL_EXAMPLE, TIMESTAMP_EXAMPLE, UUID_V4 } from '../../../src/api-model-examples';
import { BrackhitUserModel } from '../BrackhitUserModel';
import { Relations } from '../../relations/relations';
import { BrackhitModel } from '../BrackhitModel';
import { UserDeviceTypes } from '../../../src/modules/users/constants';

export class AWSUsersModel extends Model {
  id: number;
  @ApiProperty({ example: UUID_V4 })
  sub: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: EMAIL_EXAMPLE })
  email: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  birthday: string;
  @ApiProperty()
  firstTimeUser: number;
  @ApiProperty()
  staff: number;
  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  dateInserted: Date;
  @ApiProperty({ type: () => UserProfileInfoModel })
  profile?: UserProfileInfoModel;
  @ApiProperty()
  deviceType: UserDeviceTypes;

  static get tableName() {
    return 'ean_collection.aws_users';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Profile]: {
        relation: Model.HasOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'ean_collection.aws_users.sub',
          to: 'labl.user_profile_info.userId',
        },
      },

      [Relations.BrackhitUser]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitUserModel,
        join: {
          from: 'ean_collection.aws_users.sub',
          to: 'labl.brackhit_user.userId',
        },
      },

      [Relations.Brackhit]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'ean_collection.aws_users.sub',
          to: 'labl.brackhit.ownerId',
        },
      },
    };
  }
}
