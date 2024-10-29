import { Body, Controller, Get, Headers, HttpCode, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  AddUserDeviceResponseDto,
  AddUserDevicesDto,
  CustomNotificationInput,
  GetUserDevicesQueryDto,
  SendTestNotificationBodyDto,
} from '../dto/notification.dto';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { NotificationControllerService } from '../services/notification-controller.service';
import { UserDevicesModel } from '../../../../database/Models';
import { CreateNotificationSuccessResponse } from '@onesignal/node-onesignal/models/CreateNotificationSuccessResponse';

@Controller('/notifications')
@ApiTags('Notifications')
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationControllerService) {}

  @Post('/custom')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Sends notification to specified users',
  })
  @ApiResponse({ status: 200 })
  async sendCustomNotification(
    @Body() body: CustomNotificationInput,
  ): Promise<CreateNotificationSuccessResponse | CreateNotificationSuccessResponse[]> {
    return this.notificationService.sendCustomNotification(body);
  }

  @Post('/user-devices')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Adds user device',
    description: 'Adds user device',
  })
  @ApiResponse({ status: 200, type: AddUserDeviceResponseDto })
  async updateUserDevices(
    @Body() body: AddUserDevicesDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<AddUserDeviceResponseDto> {
    return this.notificationService.addDevice(resCtx.userId, body);
  }

  @Get('/user-devices')
  @ApiOperation({
    summary: 'Get user devices',
    description: 'Get user devices',
  })
  @ApiResponse({ status: 200, type: [UserDevicesModel] })
  getUserDevices(
    @Query() query: GetUserDevicesQueryDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<UserDevicesModel[]> {
    return this.notificationService.getUserDevices(resCtx.userId, query);
  }

  @Post('/suggestBrackhits')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Sends brackhits suggestion notification',
    description:
      'Sends brackhits suggestion notification to all users, that have been offline for more than a day',
  })
  @ApiResponse({ status: 200, description: 'Success! Notification has been sent to [X] users' })
  async suggestBrackhits(): Promise<string> {
    return this.notificationService.suggestBrackhits();
  }

  @Post('/test')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Sends test notification',
    description: 'Sends test notification, use only for testing purposes',
  })
  @ApiResponse({ status: 200 })
  async testNotification(
    @Body() body: SendTestNotificationBodyDto,
    @Headers('secret') secret: string,
  ): Promise<string> {
    return this.notificationService.testNotification(secret, body);
  }
}
