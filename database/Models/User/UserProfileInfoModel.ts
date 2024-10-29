import { Model } from 'objection';
import { BrackhitModel } from '../BrackhitModel';
import { AWSUsersModel } from './AWSUsersModel';
import { UserRelationship } from '../../../src/modules/friends/constants';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, USER_IMAGE, UUID_V4 } from '../../../src/api-model-examples';
import { BrackhitUserChoicesModel } from '../BrackhitUserChoicesModel';
import { Relations } from '../../relations/relations';
import { CompanyModel } from '../Company/company.model';
import { UserInfluencerModel } from './UserInfluencerModel';

export class UserProfileInfoModel extends Model {
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  userHometown: string;
  @ApiProperty()
  userBio: string;
  @ApiProperty({ example: USER_IMAGE })
  userImage: string;
  @ApiProperty()
  username: string;
  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  createdAt: Date;
  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  updatedAt: Date;
  @ApiProperty()
  profileComplete: boolean;

  count: number;
  relationshipOrder: number;
  relationship: UserRelationship;
  companies: CompanyModel[];
  influencerType: number;

  static get tableName() {
    return 'labl.user_profile_info';
  }

  static get idColumn() {
    return 'userId';
  }

  static getTableNameWithAlias(alias: string = 'upi'): string {
    return UserProfileInfoModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {
      [Relations.UserInfluencer]: {
        relation: Model.HasOneRelation,
        modelClass: UserInfluencerModel,
        join: {
          from: 'labl.user_profile_info.userId',
          to: 'labl.user_influencer.userId',
        },
      },

      brackhits: {
        relation: Model.ManyToManyRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'labl.user_profile_info.userId',
          through: {
            from: 'labl.user_profile_info.userId',
            to: 'labl.brackhit_user.userId',
          },
          to: 'labl.brackhit.brackhitId',
        },
      },

      [Relations.Choices]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitUserChoicesModel,
        join: {
          from: 'labl.user_profile_info.userId',
          to: 'labl.brackhit_user_choices.userId',
        },
      },

      aws: {
        relation: Model.HasOneRelation,
        modelClass: AWSUsersModel,
        join: {
          from: 'labl.user_profile_info.userId',
          to: 'ean_collection.aws_users.sub',
        },
      },

      [Relations.Companies]: {
        relation: Model.ManyToManyRelation,
        modelClass: CompanyModel,
        join: {
          from: 'labl.user_profile_info.userId',
          through: {
            from: 'labl.user_company.userId',
            to: 'labl.user_company.companyId',
          },
          to: 'labl.company.companyId',
        },
      },
    };
  }

  async $afterFind() {
    this.profileComplete = this.createdAt?.toISOString() !== this.updatedAt?.toISOString();
  }
}
