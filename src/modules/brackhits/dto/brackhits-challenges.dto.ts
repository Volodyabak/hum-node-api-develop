import { ApiProperty } from '@nestjs/swagger';
import { DATE_EXAMPLE, USER_IMAGE, UUID_V4 } from '../../../api-model-examples';
import { DEFAULT_BRACKHIT_IMAGE } from '../../../constants';

export class ChallengeBrackhitOwnerDto {
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty()
  username: string;
  @ApiProperty({ example: USER_IMAGE })
  userImage: string;
}

export class ChallengeBrackhitDto {
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: DEFAULT_BRACKHIT_IMAGE })
  thumbnail: string;
  @ApiProperty({ example: DATE_EXAMPLE })
  timeLive: Date;
  @ApiProperty()
  rank: number;
  @ApiProperty()
  completions: number;
  @ApiProperty({ type: ChallengeBrackhitOwnerDto })
  owner: ChallengeBrackhitOwnerDto;
}
