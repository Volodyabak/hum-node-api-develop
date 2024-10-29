import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { SearchRadius } from '../../models/location/user-search-radius.model';

class Coordinates {
  @ApiProperty()
  latitude: number;
  @ApiProperty()
  longitude: number;
}

export class UserLocationInput {
  @ApiProperty({ required: false })
  coordinates?: Coordinates;
  @ApiProperty({
    required: false,
    enum: [...Object.values(SearchRadius).filter((el) => !isNaN(Number(el)))],
  })
  @IsEnum(SearchRadius)
  searchingRadius?: SearchRadius;
}
