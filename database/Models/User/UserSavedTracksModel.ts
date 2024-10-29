import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { DATE_EXAMPLE, MODEL_ID, UUID_V4 } from '../../../src/api-model-examples';
import { Relations } from '../../relations/relations';
import { BrackhitModel } from '../BrackhitModel';
import { BrackhitContentModel } from '../Brackhit/BrackhitContentModel';

export class UserSavedTracksModel extends Model {
  @ApiProperty({ example: MODEL_ID })
  id: number;
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  choiceId: number;
  @ApiProperty()
  savedFlag: 0 | 1;
  @ApiProperty({ example: DATE_EXAMPLE })
  createdAt: Date;
  @ApiProperty({ example: DATE_EXAMPLE })
  updatedAt: Date;

  static get tableName() {
    return 'labl.user_saved_tracks';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Brackhit]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'labl.user_saved_tracks.brackhitId',
          to: 'labl.brackhit.brackhitId',
        },
      },

      [Relations.BrackhitContent]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitContentModel,
        join: {
          from: 'labl.user_saved_tracks.choiceId',
          to: 'labl.brackhit_content.choiceId',
        },
      },
    };
  }
}
