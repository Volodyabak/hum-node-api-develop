import { TicketmasterVenuesModel } from '../models/ticketmaster-venues.model';
import { TicketmasterEventModel } from '../models/ticketmaster-event.model';
import { EventProvider, EventShowStatus } from '../interfaces/events.interface';
import { ApiProperty } from '@nestjs/swagger';

export class EventIdParam {
  @ApiProperty()
  eventId: number;
}

export class VenueOutput
  implements
    Pick<
      TicketmasterVenuesModel,
      'id' | 'name' | 'city' | 'state' | 'country' | 'latitude' | 'longitude'
    >
{
  @ApiProperty()
  id: number;
  @ApiProperty({ required: false })
  name?: string;
  @ApiProperty({ required: false })
  city?: string;
  @ApiProperty({ required: false })
  state?: string;
  @ApiProperty({ required: false })
  country?: string;
  @ApiProperty({ required: false })
  latitude?: number;
  @ApiProperty({ required: false })
  longitude?: number;
}

export class EventArtistOutput {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  image: string;
}

export class EventOutput
  implements
    Pick<
      TicketmasterEventModel,
      'id' | 'name' | 'url' | 'eventDate' | 'showStatus' | 'ageRestrictions'
    >
{
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  provider: EventProvider;
  @ApiProperty()
  eventDate: Date;
  @ApiProperty({ required: false })
  url?: string;
  @ApiProperty({ required: false })
  showStatus?: EventShowStatus;
  @ApiProperty({ required: false })
  ageRestrictions?: number;
  @ApiProperty()
  venue: VenueOutput;
  @ApiProperty({ isArray: true, type: EventArtistOutput })
  artists: EventArtistOutput[];
}
