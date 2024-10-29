import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { NotificationService as NotificationServiceV2 } from '../../notifications/services/notification.service';
import { BRACKHIT_CHALLENGE_TOP_USERS } from '../constants';
import { Environment } from '../../../constants';
import { BrackhitsChallengesService } from '../../brackhits/services/brackhits-challenges.service';
import { AppEventsEmitter } from '../../app-events/app-events.emitter';
import { AppEventName } from '../../app-events/app-events.types';

@Injectable()
export class TasksService {
  private _logger = new Logger(TasksService.name);

  constructor(
    private readonly notificationService: NotificationServiceV2,
    private readonly brackhitsChallengesService: BrackhitsChallengesService,
    private readonly eventEmitter: AppEventsEmitter,
  ) {}

  @Cron(CronExpression.EVERY_WEEK)
  async keepRabbitMQAlive() {
    this.eventEmitter.emit(AppEventName.KEEP_CONNECTION, { date: new Date() });
  }

  // sends notification to top 3 users in all active challenges every Friday at 12pm EST
  @Cron('0 0 12 * * 5', { timeZone: 'America/New_York' })
  async brackhitChallenges(): Promise<void> {
    if (process.env.NODE_ENV === Environment.PROD) {
      try {
        const challenges = await this.brackhitsChallengesService.getActiveChallenges(new Date());

        await Promise.all(
          challenges.map(async (challenge) => {
            const leaderboard = await this.brackhitsChallengesService.getChallengeLeaderboard(
              challenge,
              {
                skip: 0,
                take: BRACKHIT_CHALLENGE_TOP_USERS,
              },
            );

            await Promise.all(
              leaderboard.items.map((brackhit) => {
                return this.notificationService.sendBrackhitChallengeNotification(
                  challenge,
                  brackhit,
                );
              }),
            );
          }),
        );
      } catch (err) {
        this._logger.log('BrackhitChallenges Error: ', err);
      }
    }
  }
}
