import { ApiProperty } from '@nestjs/swagger';

class PercentageType {
  [key: string]: {
    count: number;
    percentage: number;
  };
}

export class DeviceDataOutput {
  @ApiProperty({
    description: 'Percentage of users using each device type (mobile, desktop, tablet)',
    example: { mobile: { count: 6, percent: 0.6 }, desktop: { count: 4, percent: 0.4 } }
  })
  deviceType: PercentageType;

  @ApiProperty({
    description: 'Percentage of users using each mobile OS (iOS, Android)',
    example: { iOS: { count: 6, percent: 0.6 }, android: { count: 4, percent: 0.4 } }
  })
  mobileOS: PercentageType;
}
