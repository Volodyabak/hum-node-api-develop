import { ApiProperty } from '@nestjs/swagger';

export class ApiRes<T> {
  @ApiProperty({ description: 'The actual response data' })
  data: T;

  meta?: any;
}
