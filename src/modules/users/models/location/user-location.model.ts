import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

import { UserRelations } from '../user.relations';
import { AWSUsersModel } from '../../../../../database/Models';

export class UserLocationModel extends Model {
  @ApiProperty()
  public userId: string;
  @ApiProperty()
  public latitude: number;
  @ApiProperty()
  public longitude: number;
  @ApiProperty()
  public createdAt: Date;
  @ApiProperty()
  public updatedAt: Date;

  public user?: AWSUsersModel;

  static get tableName() {
    return 'labl.user_location';
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
          from: `${UserLocationModel.tableName}.${UserLocationModel.idColumn}`,
          to: `${AWSUsersModel.tableName}.sub`,
        },
      },
    };
  }
}
