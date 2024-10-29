import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

export class LogDeletedUsersModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  brackhitsCreated: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  timestamp: Date;

  static get tableName() {
    return 'labl.log_deleted_users';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {};
  }
}
