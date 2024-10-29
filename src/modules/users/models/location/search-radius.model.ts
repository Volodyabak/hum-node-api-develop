import { ApiProperty } from '@nestjs/swagger';
import { Model } from 'objection';

export class SearchRadiusModel extends Model {
  @ApiProperty()
  public id: string;
  @ApiProperty()
  public radiusMiles: number;

  static get tableName() {
    return 'labl.search_radius';
  }

  static get idColumn() {
    return 'id';
  }
}
