import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

import { EventShowStatus } from '../interfaces/events.interface';
import { TicketmasterVenuesModel } from './ticketmaster-venues.model';
import { TicketmasterArtistEventModel } from './ticketmaster-artist-event.model';
import { ArtistModel } from '../../../../database/Models';
import { Relations } from '../../../../database/relations/relations';

export class TicketmasterEventModel extends Model {
  @ApiProperty()
  public id: number;
  @ApiProperty()
  public ticketmasterEventId: string;
  @ApiProperty()
  public name: string;
  @ApiProperty({ required: false })
  public url?: string;
  @ApiProperty({ required: false })
  public venueId?: number;
  @ApiProperty({ required: false })
  public ageRestrictions?: number;
  @ApiProperty({ required: false })
  public showStatus?: EventShowStatus;
  @ApiProperty()
  public eventDate: Date;
  @ApiProperty()
  public localEventDate: Date;
  @ApiProperty()
  public createdAt: Date;
  @ApiProperty()
  public updatedAt: Date;

  link: string;

  public artists?: ArtistModel[];
  public venue?: TicketmasterVenuesModel;

  static get tableName() {
    return 'ean_collection.ticketmaster_event';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Artists]: {
        relation: Model.ManyToManyRelation,
        modelClass: ArtistModel,
        join: {
          from: `${TicketmasterEventModel.tableName}.${TicketmasterEventModel.idColumn}`,
          through: {
            modelClass: TicketmasterArtistEventModel,
            from: `${TicketmasterArtistEventModel.tableName}.eventId`,
            to: `${TicketmasterArtistEventModel.tableName}.artistId`,
          },
          to: `${ArtistModel.tableName}.${ArtistModel.idColumn}`,
        },
      },

      [Relations.TicketmasterVenue]: {
        relation: Model.HasOneRelation,
        modelClass: TicketmasterVenuesModel,
        join: {
          from: `${TicketmasterEventModel.tableName}.venueId`,
          to: `${TicketmasterVenuesModel.tableName}.${TicketmasterVenuesModel.idColumn}`,
        },
      },
    };
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
