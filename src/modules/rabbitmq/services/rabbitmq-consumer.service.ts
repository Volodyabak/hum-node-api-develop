import { Injectable, Logger } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';

import { AppEvent, AppEventName, AppEventPayload } from '../../app-events/app-events.types';
import { EXCHANGE_NAME, QUEUE_NAME, ROUTING_KEY } from '../interfaces/rabbitmq.interface';
import { EventsHandlerService } from '../../events-handler/services/events-handler.service';

@Injectable()
export class RabbitmqConsumerService {
  private readonly logger = new Logger(RabbitmqConsumerService.name);

  constructor(private readonly eventsHandlerService: EventsHandlerService) {}

  @RabbitRPC({
    exchange: EXCHANGE_NAME.API_EXCHANGE,
    routingKey: ROUTING_KEY.APP_EVENTS,
    queue: QUEUE_NAME.APP_MESSAGES,
  })
  async handler(message: AppEvent) {
    // todo: add retry logic
    this.logger.log(
      `PROCESSING EVENT ${message.eventName}: ${JSON.stringify(message.eventData, null, 2)}`,
    );
    if (message?.eventName && message?.eventData) {
      try {
        switch (message.eventName) {
          case AppEventName.CREATE_BRACKHIT_CHALLENGE:
            return await this.eventsHandlerService.handleCreateBrackhitChallengeEvent(
              message.eventData as AppEventPayload[AppEventName.CREATE_BRACKHIT_CHALLENGE],
            );
          case AppEventName.BRACKHIT_COMMENT_LIKE:
            return await this.eventsHandlerService.handleBrackhitCommentLikeEvent(
              message.eventData as AppEventPayload[AppEventName.BRACKHIT_COMMENT_LIKE],
            );
          case AppEventName.CREATE_USER:
            return await this.eventsHandlerService.handleCreateUserEvent(
              message.eventData as AppEventPayload[AppEventName.CREATE_USER],
            );
          case AppEventName.CONNECT_SPOTIFY:
            return await this.eventsHandlerService.handleConnectSpotifyEvent(
              message.eventData as AppEventPayload[AppEventName.CONNECT_SPOTIFY],
            );
          case AppEventName.USER_SENT_FRIEND_REQUEST:
            return await this.eventsHandlerService.handleUserSentFriendRequestEvent(
              message.eventData as AppEventPayload[AppEventName.USER_SENT_FRIEND_REQUEST],
            );
          case AppEventName.USER_ACCEPTED_FRIEND_REQUEST:
            return await this.eventsHandlerService.handleUserAcceptedFriendRequest(
              message.eventData as AppEventPayload[AppEventName.USER_ACCEPTED_FRIEND_REQUEST],
            );
          case AppEventName.CREATE_BRACKHIT:
            return await this.eventsHandlerService.handleCreateBrackhitEvent(
              message.eventData as AppEventPayload[AppEventName.CREATE_BRACKHIT],
            );
          case AppEventName.USER_COMPLETE_BRACKHIT:
            return await this.eventsHandlerService.handleUserCompleteBrackhitEvent(
              message.eventData as AppEventPayload[AppEventName.USER_COMPLETE_BRACKHIT],
            );
          case AppEventName.BRACKHIT_CREATOR_COMPLETIONS_NOTIFICATION:
            return await this.eventsHandlerService.handleBrackhitCreatorCompletionNotificationEvent(
              message.eventData as AppEventPayload[AppEventName.BRACKHIT_CREATOR_COMPLETIONS_NOTIFICATION],
            );
          case AppEventName.CALCULATE_BRACKHIT_RESULTS:
            return await this.eventsHandlerService.handleCalculateBrackhitResultsEvent(
              message.eventData as AppEventPayload[AppEventName.CALCULATE_BRACKHIT_RESULTS],
            );
          case AppEventName.COMMENT_BRACKHIT:
            return await this.eventsHandlerService.handleCommentBrackhitEvent(
              message.eventData as AppEventPayload[AppEventName.COMMENT_BRACKHIT],
            );
          case AppEventName.REPLY_BRACKHIT_COMMENT:
            return await this.eventsHandlerService.handleReplyBrackhitCommentEvent(
              message.eventData as AppEventPayload[AppEventName.REPLY_BRACKHIT_COMMENT],
            );
          case AppEventName.FETCH_USER_SPOTIFY_TOP_TRACKS:
            return await this.eventsHandlerService.handleFetchUserSpotifyTopTracksEvent(
              message.eventData as AppEventPayload[AppEventName.FETCH_USER_SPOTIFY_TOP_TRACKS],
            );
          case AppEventName.FETCH_USER_SPOTIFY_TOP_ARTISTS:
            return await this.eventsHandlerService.handleFetchUserSpotifyTopArtistsEvent(
              message.eventData as AppEventPayload[AppEventName.FETCH_USER_SPOTIFY_TOP_ARTISTS],
            );
        }
      } catch (err) {
        this.logger.error(`ERROR PROCESSING EVENT ${message.eventName}: ${err.message}`);
      }

      this.logger.log(`EVENT ${message.eventName} PROCESSED`);
    }
  }
}
