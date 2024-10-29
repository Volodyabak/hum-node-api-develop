import { ApiProperty } from '@nestjs/swagger';

export class SaveMusicUserTokenInput {
  @ApiProperty()
  musicUserToken: string;
}
