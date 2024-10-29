import { ApiProperty } from '@nestjs/swagger';

import { EventOutput } from '../events.common.dto';

export class GetEventOutput {
  @ApiProperty()
  centralId: number;
  @ApiProperty()
  liked: boolean;
  @ApiProperty()
  event: EventOutput;
}
