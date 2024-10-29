import { Model } from 'objection';

import { TIMESTAMP_EXAMPLE, UUID_V4 } from '../../../src/api-model-examples';
import {
  ONE_SIGNAL_ID,
  USER_DEVICE_KEY,
} from '../../../src/modules/notifications/constants/notification.constants';
import { ApiProperty } from '@nestjs/swagger';

export class UserDevicesModel extends Model {
  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: USER_DEVICE_KEY })
  deviceKey: string;

  @ApiProperty()
  pushEnabled: boolean;

  @ApiProperty({ example: ONE_SIGNAL_ID })
  oneSignalId: string;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  lastAuthenticatedDate: Date;

  static get tableName() {
    return 'ean_collection.user_devices';
  }

  static get idColumn() {
    return ['userId', 'deviceKey'];
  }
}
