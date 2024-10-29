import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';


import { EventsRelations } from '../repositories/events.relations';
import { TicketmasterArtistImagesModel } from './ticketmaster-artist-images.model';

export class TicketmasterArtistModel extends Model {
  @ApiProperty()
  public artistId: number;
  @ApiProperty({ required: false })
  public ticketmasterId?: string;
  @ApiProperty({ required: false })
  public ticketmasterName?: string;
  @ApiProperty({ required: false })
  public genre?: string;
  @ApiProperty({ required: false })
  public subGenre?: string;
  @ApiProperty({ required: false })
  public upcomingEvents?: string;
  @ApiProperty({ required: false })
  public upcomingTicketmasterEvents?: string;
  @ApiProperty()
  public dateInserted: Date;
  @ApiProperty()
  public createdAt: Date;
  @ApiProperty()
  public lastChecked: Date;

  public images?: TicketmasterArtistImagesModel[];

  static get tableName() {
    return 'ean_collection.ticketmaster_artist';
  }

  static get idColumn() {
    return 'artist_id';
  }

  static get relationMappings() {
    return {
      [EventsRelations.TicketmasterArtistImages]: {
        relation: Model.HasManyRelation,
        modelClass: TicketmasterArtistImagesModel,
        join: {
          from: `${TicketmasterArtistModel.tableName}.${TicketmasterArtistModel.idColumn}`,
          to: `${TicketmasterArtistImagesModel.tableName}.${TicketmasterArtistImagesModel.idColumn}`,
        },
      },
    };
  }
}
