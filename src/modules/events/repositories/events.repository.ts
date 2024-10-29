import { Injectable } from '@nestjs/common';

import { TicketmasterEventModel } from '../models/ticketmaster-event.model';
import { TicketmasterArtistEventModel } from '../models/ticketmaster-artist-event.model';
import { EventsRelations } from './events.relations';

@Injectable()
export class EventsRepository {
  getEvent(data: Partial<TicketmasterEventModel>) {
    return TicketmasterEventModel.query().findOne(data);
  }

  getEvents(data: Partial<TicketmasterEventModel>) {
    return TicketmasterEventModel.query().alias(EventsRelations.TicketmasterEvent).where(data);
  }

  getArtistEvents(data?: Partial<TicketmasterArtistEventModel>) {
    return TicketmasterArtistEventModel.query()
      .alias(EventsRelations.TicketmasterArtistEvent)
      .where(data);
  }
}
