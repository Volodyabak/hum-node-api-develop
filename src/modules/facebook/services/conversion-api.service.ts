import { v4 } from 'uuid';
import * as bizSdk from 'facebook-nodejs-business-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { FacebookEventPayload } from '../interfaces/conversion-api.intefraces';
import { Environment } from '../../../constants';
import { conversionApiConfig } from '../configs/conversion-api.config';

@Injectable()
export class ConversionApiService {
  private readonly logger = new Logger(ConversionApiService.name);

  async sendEvent(payload: FacebookEventPayload) {
    if (process.env.NODE_ENV === Environment.PROD) {
      const eventId = v4();
      const current_timestamp = Math.floor(new Date().getTime() / 1000);

      const userData = new bizSdk.UserData()
        .setEmails(payload.userData.emails)
        .setFirstName(payload.userData.firstName)
        .setLastName(payload.userData.lastName);

      const serverEvent = new bizSdk.ServerEvent()
        .setEventName(payload.eventName)
        .setEventId(eventId)
        .setEventTime(current_timestamp)
        .setUserData(userData)
        .setEventSourceUrl(payload.endpoint)
        .setActionSource('website');

      const eventRequest = new bizSdk.EventRequest(
        conversionApiConfig.accessToken,
        conversionApiConfig.pixelId,
      ).setEvents([serverEvent]);

      try {
        const response = await eventRequest.execute();
        this.logger.log('Response:', JSON.stringify(response, null, 2));
      } catch (err) {
        this.logger.error('Error', err);
      }
    }
  }
}
