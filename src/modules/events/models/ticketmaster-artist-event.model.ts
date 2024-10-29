import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

import { TicketmasterEventModel } from './ticketmaster-event.model';
import { EventsRelations } from '../repositories/events.relations';

export class TicketmasterArtistEventModel extends Model {
  @ApiProperty()
  public id: number;
  @ApiProperty()
  public eventId: number;
  @ApiProperty()
  public artistId: number;

  public event?: TicketmasterEventModel;

  static get tableName() {
    return 'ean_collection.ticketmaster_artist_event';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [EventsRelations.TicketmasterEvent]: {
        relation: Model.BelongsToOneRelation,
        modelClass: TicketmasterEventModel,
        join: {
          from: `${TicketmasterArtistEventModel.tableName}.eventId`,
          to: `${TicketmasterEventModel.tableName}.${TicketmasterEventModel.idColumn}`,
        },
      },
    };
  }
}
