import { UserLocationModel } from '../../models/location/user-location.model';
import { UserSearchRadiusModel } from '../../models/location/user-search-radius.model';
import { ApiProperty } from '@nestjs/swagger';

export class PutUserLocationOutput {
  @ApiProperty()
  location: UserLocationModel;
  @ApiProperty()
  searchRadius: UserSearchRadiusModel;
}
