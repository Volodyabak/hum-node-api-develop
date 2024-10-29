import { Model } from 'objection';
import { FeedTypes } from '../../src/Services/Feed/constants';
import { ApiProperty } from '@nestjs/swagger';

export abstract class FeedItemBaseModel extends Model {
  @ApiProperty()
  feedType: FeedTypes;
  @ApiProperty()
  timestamp: Date;
}
