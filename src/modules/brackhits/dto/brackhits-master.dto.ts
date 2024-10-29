import { ApiProperty } from '@nestjs/swagger';

class BrackhitTrackContent {
  @ApiProperty({ example: 23 })
  id: number;

  @ApiProperty({ example: 'Perfect' })
  trackName: string;

  @ApiProperty({ example: 'Ed Sheeran' })
  artists: string;

  @ApiProperty({ example: '0tgVpDi06FyKpA1z0VMD4v' })
  trackKey: string;

  @ApiProperty({ example: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96' })
  albumImage: string;

  @ApiProperty({
    example:
      'https://p.scdn.co/mp3-preview/229419b7fe43f4aa963e8ed8eecabc4b87c4958e?cid=6acfcfd9cc624b5983e6cfc3ae0c91cf',
  })
  preview: string;
}

class BrackhitMasterInitial {
  @ApiProperty({ example: 201 })
  brackhitId: number;

  @ApiProperty({ example: 1 })
  roundId: number;

  @ApiProperty({ example: 1904 })
  choiceId: number;

  @ApiProperty({ example: 1 })
  seed: number;

  @ApiProperty({ example: 1 })
  contentTypeId: number;

  @ApiProperty({ example: 'track' })
  type: string;

  @ApiProperty({ example: 23 })
  contentId: number;

  @ApiProperty()
  content: BrackhitTrackContent;
}

class BrackhitMasterWinners extends BrackhitMasterInitial {
  @ApiProperty({ example: 1 })
  winner: number;

  @ApiProperty({ example: 73 })
  votes: number;

  @ApiProperty({ example: 0.67 })
  percent: number;
}

export class BrackhitMasterResponseDto {
  @ApiProperty({ isArray: true, type: BrackhitMasterInitial })
  initial: BrackhitMasterInitial[];

  @ApiProperty({ isArray: true, type: BrackhitMasterWinners })
  winners: BrackhitMasterWinners[];
}
