import { ApiProperty } from '@nestjs/swagger';

export class DirectoryContentsResponseDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  lastModified: Date;

  @ApiProperty()
  size: number;
}
