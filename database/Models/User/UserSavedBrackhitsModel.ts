import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { DATE_EXAMPLE, MODEL_ID, UUID_V4 } from '../../../src/api-model-examples';
import { Relations } from '../../relations/relations';
import { BrackhitModel } from '../BrackhitModel';

export class UserSavedBrackhitsModel extends Model {
  @ApiProperty({ example: MODEL_ID })
  id: number;
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty()
  brackhitId: number;
  @ApiProperty({ example: DATE_EXAMPLE })
  timestamp: Date;

  static get tableName() {
    return 'labl.user_saved_brackhits';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Brackhit]: {
        relation: Model.HasOneRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'labl.user_saved_brackhits.brackhitId',
          to: 'labl.brackhit.brackhitId',
        },
      },
    };
  }
}
