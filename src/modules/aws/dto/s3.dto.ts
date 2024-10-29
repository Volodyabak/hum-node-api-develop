import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileBody {
  @ApiProperty()
  @IsNotEmpty()
  key: string;
}

export class UploadFileResponse {
  @ApiProperty()
  key: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  name: string;
}

export class FileKeyQuery {
  @ApiProperty()
  @IsNotEmpty()
  key: string;
}
