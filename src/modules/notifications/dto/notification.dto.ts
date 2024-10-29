import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ONE_SIGNAL_ID, USER_DEVICE_KEY } from '../constants/notification.constants';
import { Transform } from 'class-transformer';
import { DeviceType } from '../../one-signal/interfaces/one-signal.interface';
import { Notification, StringMap } from '@onesignal/node-onesignal';
import { ApiProperty } from '@nestjs/swagger';

export class CustomNotificationInput
  implements
    Pick<
      Notification,
      'headings' | 'contents' | 'data' | 'include_external_user_ids' | 'included_segments'
    >
{
  @ApiProperty()
  contents: StringMap;

  @ApiProperty()
  headings: StringMap;

  @ApiProperty()
  data: Record<string, unknown>;

  @ApiProperty()
  image: string;

  @ApiProperty({ required: false, isArray: true })
  @IsUUID(4, { each: true })
  includedUserIds: Array<string>;

  @ApiProperty({ required: false })
  includedSegments: Array<string>;
}

export class SendCustomNotificationBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string = '';
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string = '';
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  link: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  image: string;
  @ApiProperty({ isArray: true })
  @IsUUID(4, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  userIds: string[];
}

export class AddUserDevicesDto {
  @ApiProperty({ example: USER_DEVICE_KEY })
  @IsNotEmpty()
  deviceKey: string;

  @ApiProperty()
  @IsOptional()
  pushEnabled: boolean;

  @ApiProperty({
    required: false,
    enum: Object.keys(DeviceType),
    example: 'iOS',
  })
  @IsOptional()
  @IsEnum(DeviceType)
  deviceType: keyof typeof DeviceType = 'iOS';
}

export class AddUserDeviceResponseDto {
  @ApiProperty()
  @IsDefined()
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: ONE_SIGNAL_ID })
  @IsString()
  @IsNotEmpty()
  oneSignalId: string;
}

export class SendTestNotificationBodyDto {
  @ApiProperty({ isArray: true, example: [ONE_SIGNAL_ID] })
  @IsString({ each: true })
  @ArrayMinSize(1)
  userIds: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  message: string;

  @ApiProperty()
  @IsOptional()
  data: Record<string, unknown>;
}

export class GetUserDevicesQueryDto {
  @ApiProperty({ required: false, example: USER_DEVICE_KEY })
  deviceKey?: string;

  @ApiProperty({ required: false, example: ONE_SIGNAL_ID })
  oneSignalId?: string;

  @ApiProperty({ required: false })
  @Transform(({ value }) => value === 'true')
  pushEnabled?: boolean;
}
