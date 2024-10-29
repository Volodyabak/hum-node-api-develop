import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

export class TicketmasterVenuesModel extends Model {
  @ApiProperty()
  public id: number;
  @ApiProperty()
  public ticketmasterVenueId: string;
  @ApiProperty({ required: false })
  public name?: string;
  @ApiProperty({ required: false })
  public url?: string;
  @ApiProperty({ required: false })
  public image?: string;
  @ApiProperty({ required: false })
  public postalCode?: string;
  @ApiProperty({ required: false })
  public city?: string;
  @ApiProperty({ required: false })
  public state?: string;
  @ApiProperty({ required: false })
  public country?: string;
  @ApiProperty({ required: false })
  public longitude?: number;
  @ApiProperty({ required: false })
  public latitude?: number;
  @ApiProperty()
  public createdAt: Date;
  @ApiProperty()
  public updatedAt: Date;

  link: string;

  static get tableName() {
    return 'ean_collection.ticketmaster_venues';
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
