import { EventsRelations } from '../../repositories/events.relations';

export const EventRestQueryColumns = {
  event_date: `${EventsRelations.TicketmasterEvent}.eventDate`,
};
