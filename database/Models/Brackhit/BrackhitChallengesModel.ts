import { Model } from 'objection';
import { GenreModel } from '../GenreModel';
import { Relations } from '../../relations/relations';
import { ApiProperty } from '@nestjs/swagger';

export class BrackhitChallengesModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  challengeName: string;
  @ApiProperty()
  genreId: number;
  @ApiProperty()
  genreName: string;
  @ApiProperty()
  reward: number;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  endDate: Date;

  static get tableName() {
    return 'labl.challenges';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Genre]: {
        relation: Model.HasOneRelation,
        modelClass: GenreModel,
        join: {
          from: 'labl.challenges.genreId',
          to: 'ean_collection.genre.genreId',
        },
      },
    };
  }

  $afterFind() {
    if (this.genreName !== undefined) {
      this.genreName = this.genreName || '';
    }
  }
}
