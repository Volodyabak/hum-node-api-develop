import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

export class TicketmasterArtistLinksModel extends Model {
  @ApiProperty()
  public id: number;
  @ApiProperty()
  public artistId: number;
  @ApiProperty()
  public source: string;
  @ApiProperty()
  public linkType: string;
  @ApiProperty()
  public link: string;

  static get tableName() {
    return 'ean_collection.ticketmaster_artist_links';
  }

  static get idColumn() {
    return 'id';
  }
}
