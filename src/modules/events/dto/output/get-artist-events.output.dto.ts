import { ApiProperty } from '@nestjs/swagger';

import { EventOutput } from '../events.common.dto';
import { PaginationResponseDto } from '../../../../Tools/dto/main-api.dto';

class ArtistEventData {
  @ApiProperty()
  centralId: number;
  @ApiProperty()
  event: EventOutput;
}

export class GetArtistEventsOutput {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty({ type: [ArtistEventData] })
  data: ArtistEventData[];
  @ApiProperty()
  pagination: PaginationResponseDto;
}
