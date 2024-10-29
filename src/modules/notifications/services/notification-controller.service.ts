import { Injectable, Logger } from '@nestjs/common';

import {
  AddUserDeviceResponseDto,
  AddUserDevicesDto,
  CustomNotificationInput,
  GetUserDevicesQueryDto,
  SendTestNotificationBodyDto,
} from '../dto/notification.dto';
import { ForbiddenError } from '../../../Errors';
import { OneSignalClient } from '../../one-signal/services/one-signal.client';
import { NOTIFICATION_TEST_SECRET } from '../constants/notification.constants';
import { NotificationService } from './notification.service';
import { LogUserNavModel, UserDevicesModel } from '../../../../database/Models';
import { BrackhitHubsService } from '../../../Services/Brackhits/BrackhitHubsService';
import { BrackhitsServiceExpress } from '../../../Services/Brackhits/BrackhitsServiceExpress';
import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import { DeviceType } from '../../one-signal/interfaces/one-signal.interface';
import { Notification } from '@onesignal/node-onesignal';
import { CreateNotificationSuccessResponse } from '@onesignal/node-onesignal/models/CreateNotificationSuccessResponse';
import { ONE_SIGNAL_BATCH_SIZE } from '../../../constants';

@Injectable()
export class NotificationControllerService {
  private readonly logger = new Logger(NotificationControllerService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly oneSignalClient: OneSignalClient,
  ) {}

  async addDevice(userId: string, body: AddUserDevicesDto): Promise<AddUserDeviceResponseDto> {
    const { success, id } = await this.oneSignalClient.addDevice({
      identifier: body.deviceKey,
      device_type: DeviceType[body.deviceType],
      external_user_id: userId,
    });

    if (success) {
      await UserDevicesModel.query()
        .insertAndFetch({
          userId,
          oneSignalId: id,
          deviceKey: body.deviceKey,
          pushEnabled: body.pushEnabled,
          lastAuthenticatedDate: new Date(),
        })
        .onConflict()
        .merge();
    }

    return {
      success,
      oneSignalId: id,
    };
  }

  async suggestBrackhits(): Promise<string> {
    const users = await LogUserNavModel.query()
      .groupBy('userId')
      .havingRaw('TIMESTAMPDIFF(HOUR, MAX(timestamp), CURRENT_TIMESTAMP) > 24');

    const userBrackhits = new Map<string, BrackhitModel[]>();
    await Promise.all(
      users.map(async (user) => {
        const brackhits = await BrackhitHubsService.getForYouBrackhits(
          user.userId,
          new Date(),
          Number.MAX_SAFE_INTEGER,
        );
        if (brackhits.length) {
          userBrackhits.set(user.userId, brackhits);
        }
      }),
    );

    await Promise.all(
      Array.from(userBrackhits).map(async ([userId, brackhits]) => {
        const brackhitIds = brackhits.map((el) => el.brackhitId);
        const [brackhit] = await BrackhitsServiceExpress.sortBrackhitsByCompletions(brackhitIds);
        return this.notificationService.sendSuggestBrackhitNotification(
          brackhit.brackhitId,
          userId,
        );
      }),
    );

    return `Success! Notification has been sent to ${userBrackhits.size} users`;
  }

  async testNotification(secret: string, body: SendTestNotificationBodyDto): Promise<string> {
    if (secret !== NOTIFICATION_TEST_SECRET) {
      throw new ForbiddenError('');
    }

    return this.notificationService.sendTestNotification(body);
  }

  async getUserDevices(userId: string, query: GetUserDevicesQueryDto): Promise<UserDevicesModel[]> {
    return UserDevicesModel.query().where({ userId, ...query });
  }

  async sendCustomNotification(
    body: CustomNotificationInput,
  ): Promise<CreateNotificationSuccessResponse | CreateNotificationSuccessResponse[]> {
    // todo: add security header check
    try {
      const notification = new Notification();

      notification.headings = body.headings;
      notification.contents = body.contents;
      if (body.data) {
        notification.data = body.data;
      }

      if (body.image) {
        notification.big_picture = body.image;
        notification.ios_attachments = { image: body.image };
      }

      if (body.includedUserIds) {
        const devices = await this.notificationService.getUsersDevices(body.includedUserIds);
        const playerIds = Array.from(
          new Set(devices.filter((el) => el.pushEnabled).map((el) => el.oneSignalId)),
        );

        if (playerIds.length > ONE_SIGNAL_BATCH_SIZE) {
          const result = [];
          for (let i = 0; i < playerIds.length; i += ONE_SIGNAL_BATCH_SIZE) {
            notification.include_player_ids = playerIds.slice(i, i + ONE_SIGNAL_BATCH_SIZE);
            const response = await this.oneSignalClient.sendSdkNotification(notification);
            result.push(response);
          }
          return result;
        }

        notification.include_player_ids = playerIds;
      } else if (body.includedSegments) {
        notification.included_segments = body.includedSegments;
      }

      return await this.oneSignalClient.sendSdkNotification(notification);
    } catch (err) {
      this.logger.error(err);
      throw new Error('Failed to send custom notification');
    }
  }
}
