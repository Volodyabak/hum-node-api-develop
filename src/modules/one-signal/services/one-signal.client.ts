import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as OneSignal from 'onesignal-node';
import { createConfiguration, DefaultApi, Notification } from '@onesignal/node-onesignal';

import { oneSignalConfig } from '../configs/one-signal.config';
import {
  AddDeviceBody,
  EditDeviceBody,
  EditTagsBody,
  ViewNotificationsQuery,
} from 'onesignal-node/lib/types';
import {
  CreateNotification,
  CreateNotificationInput,
  CreateNotificationResponseBody,
} from '../interfaces/one-signal.interface';
import { CreateNotificationSuccessResponse } from '@onesignal/node-onesignal/models/CreateNotificationSuccessResponse';

const appKeyProvider = {
  getToken() {
    return oneSignalConfig.apiKey;
  },
};

const configuration = createConfiguration({
  authMethods: {
    app_key: {
      tokenProvider: appKeyProvider,
    },
  },
});

@Injectable()
export class OneSignalClient {
  private _logger = new Logger(OneSignalClient.name);
  private _instance: AxiosInstance;
  private _client: OneSignal.Client;
  private _sdkClient = new DefaultApi(configuration);

  constructor() {
    this._client = new OneSignal.Client(oneSignalConfig.appId, oneSignalConfig.apiKey);
    this._instance = axios.create({
      headers: {
        Authorization: `Basic ${oneSignalConfig.apiKey}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      baseURL: oneSignalConfig.baseUrl,
    });
  }

  async viewNotification(notificationId: string) {
    const response = await this._client.viewNotification(notificationId);
    return response.body;
  }

  async viewNotifications(query?: ViewNotificationsQuery) {
    const response = await this._client.viewNotifications(query);
    return response.body;
  }

  async editDevice(deviceId: string, body: EditDeviceBody) {
    const response = await this._client.editDevice(deviceId, body);
    return response.body;
  }

  async editUserTags(userId: string, body: EditTagsBody) {
    const response = await this._client.editTagsWithExternalUserIdDevice(userId, body);
    return response.body;
  }

  async addDevice(body: AddDeviceBody) {
    const response = await this._client.addDevice(body);
    return response.body;
  }

  async sendNotification(data: CreateNotificationInput): Promise<CreateNotificationResponseBody> {
    const payload: CreateNotification = {
      app_id: oneSignalConfig.appId,
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
      ...data,
    };

    return this.request({ method: 'POST', url: '/notifications', data: payload });
  }

  async sendSdkNotification(
    notification: Notification,
  ): Promise<CreateNotificationSuccessResponse> {
    notification.app_id = oneSignalConfig.appId;
    notification.ios_badge_type = 'Increase';
    notification.ios_badge_count = 1;

    return this._sdkClient.createNotification(notification);
  }

  private async request(config: AxiosRequestConfig) {
    try {
      const response = await this._instance.request({ ...config });

      if (response.status !== 200) {
        throw new Error(response.data);
      }

      return response.data;
    } catch (err) {
      this._logger.error(err);
    }
  }
}
