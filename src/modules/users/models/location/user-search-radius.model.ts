import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

import { UserRelations } from '../user.relations';
import { AWSUsersModel } from '../../../../../database/Models';
import { SearchRadiusModel } from './search-radius.model';

export enum SearchRadius {
  TenMiles = 1,
  TwentyFiveMiles = 2,
  FiftyMiles = 3,
  OneHundredMiles = 4,
}

export class UserSearchRadiusModel extends Model {
  @ApiProperty()
  public userId: string;
  @ApiProperty()
  public searchRadiusId: SearchRadius;
  @ApiProperty()
  public createdAt: Date;
  @ApiProperty()
  public updatedAt: Date;

  public user?: AWSUsersModel;
  @ApiProperty()
  public searchRadius?: SearchRadiusModel;

  static get tableName() {
    return 'labl.user_search_radius';
  }

  static get idColumn() {
    return 'userId';
  }

  static get relationMappings() {
    return {
      [UserRelations.AwsUser]: {
        relation: Model.BelongsToOneRelation,
        modelClass: AWSUsersModel,
        join: {
          from: `${UserSearchRadiusModel.tableName}.${UserSearchRadiusModel.idColumn}`,
          to: `${AWSUsersModel.tableName}.sub`,
        },
      },

      [UserRelations.SearchRadius]: {
        relation: Model.BelongsToOneRelation,
        modelClass: SearchRadiusModel,
        join: {
          from: `${UserSearchRadiusModel.tableName}.searchRadiusId`,
          to: `${SearchRadiusModel.tableName}.${SearchRadiusModel.idColumn}`,
        },
      },
    };
  }
}
