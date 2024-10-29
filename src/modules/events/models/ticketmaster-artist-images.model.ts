import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

export class TicketmasterArtistImagesModel extends Model {
  @ApiProperty()
  public id: number;
  @ApiProperty()
  public artistId: number;
  @ApiProperty()
  public url: string;
  @ApiProperty({ required: false })
  public width?: number;
  @ApiProperty({ required: false })
  public height?: number;

  link: string;

  static get tableName() {
    return 'ean_collection.ticketmaster_artist_images';
  }

  static get idColumn() {
    return 'id';
  }

  async $afterFind() {
    this.url = this.link;
  }

  async $beforeInsert() {
    if (this.url) {
      this.link = this.url;
      this.url = undefined;
    }
  }

  async $beforeUpdate() {
    if (this.url) {
      this.link = this.url;
      this.url = undefined;
    }
  }
}
