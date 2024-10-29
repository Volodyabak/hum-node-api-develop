import { TicketmasterEventModel } from '../models/ticketmaster-event.model';
import { ArtistModel } from '../../../../database/Models';
import { EventProvider } from '../interfaces/events.interface';
import { TicketmasterVenuesModel } from '../models/ticketmaster-venues.model';
import { EventArtistOutput, EventOutput, VenueOutput } from '../dto/events.common.dto';

function formatVenue(venue: TicketmasterVenuesModel): VenueOutput {
  return {
    id: venue.id,
    name: venue.name,
    city: venue.city,
    state: venue.state,
    country: venue.country,
    latitude: venue.latitude,
    longitude: venue.longitude,
  };
}

function formatArtist(artist: ArtistModel): EventArtistOutput {
  return {
    id: artist.id,
    name: artist.facebookName,
    image: artist.imageFile,
  };
}

export function formatEvent(event: TicketmasterEventModel): EventOutput {
  return {
    id: event.id,
    name: event.name,
    provider: EventProvider.Ticketmaster,
    eventDate: event.localEventDate,
    url: event.url,
    showStatus: event.showStatus,
    ageRestrictions: event.ageRestrictions,
    venue: formatVenue(event.venue),
    artists: (event.artists || []).map((artist) => formatArtist(artist)),
  };
}
