import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NotificationService } from '../../notifications/services/notification.service';
import {
  BrackhitChallengesModel,
} from '../../../../database/Models';
import {
  ScheduledTaskType,
} from '../interfaces/scheduled-task.interface';
import { BrackhitsChallengesService } from '../../brackhits/services/brackhits-challenges.service';
import { Environment, HOUR } from '../../../constants';
import { RepositoryService } from '../../repository/services/repository.service';
import { ConstantId } from '../../constants/constants';

@Injectable()
export class ScheduledTaskService implements OnModuleInit {
  private readonly logger = new Logger(ScheduledTaskService.name);

  constructor(
    private readonly repoService: RepositoryService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly notificationService: NotificationService,
    private readonly brackhitsChallengesService: BrackhitsChallengesService,
  ) {}

  async onModuleInit(): Promise<any> {
    await Promise.all([this.initProdScheduledTasks(), this.initLocalScheduledTasks()]);
  }

  private async initProdScheduledTasks() {
    if (process.env.NODE_ENV === Environment.PROD) {
      const tasks = await this.repoService.scheduledTaskRepo.findScheduledTasks({
        stage: Environment.PROD,
      });
      await Promise.all(
        tasks.map((task) => {
          if (task.type === ScheduledTaskType.BRACKHIT_CHALLENGE_WINNER_NOTIFICATION) {
            const challenge = JSON.parse(task.data) as BrackhitChallengesModel;
            return this.scheduleBrackhitChallengeWinnerNotification(challenge.id);
          }
          // if (task.type === ScheduledTaskType.ALL_PENDING_REQUESTS_NOTIFICATION_JOB) {
          //   return this.scheduleAllPendingRequestsNotification(task);
          // }
        }),
      );
    }
  }

  // used for testing scheduled tasks initialization locally
  private async initLocalScheduledTasks() {
    if (process.env.NODE_ENV === Environment.LOCAL) {
      // const tasks = await this.repoService.scheduledTaskRepo.findScheduledTasks({
      //   stage: Environment.LOCAL,
      // });
      //
      // await Promise.all(tasks.map((task) => {}));
    }
  }

  async scheduleBrackhitChallengeWinnerNotification(challengeId: number) {
    const taskName = `brackhit-challenge-${challengeId}-winner-notification`;

    if (!this.schedulerRegistry.doesExist('timeout', taskName)) {
      const challenge = await BrackhitChallengesModel.query().findById(challengeId);
      const scheduledTask = await this.repoService.scheduledTaskRepo.createOrUpdateScheduledTask({
        name: taskName,
        type: ScheduledTaskType.BRACKHIT_CHALLENGE_WINNER_NOTIFICATION,
        data: JSON.stringify(challenge),
        stage: Environment.PROD,
      });
      const ms = challenge.endDate.getTime() - Date.now();

      const timeoutId = setTimeout(async () => {
        const winner = await this.brackhitsChallengesService.getChallengeWinner(challenge);

        if (winner) {
          await this.notificationService.sendBrackhitChallengeWinnerNotification(challenge, winner);
        }

        await this.repoService.scheduledTaskRepo.deleteScheduledTaskById(scheduledTask.id);
      }, ms);

      this.schedulerRegistry.addTimeout(taskName, timeoutId);
    }
  }

  async scheduleCreateBrackhitNotification(userId: string) {
    const [completedBrackhits, createdBrackhits, firstNotificationConst, secondNotificationConst] =
      await Promise.all([
        this.repoService.userRepo.getUserCompletedBrackhits(userId).resultSize(),
        this.repoService.userRepo.getUserCreatedBrackhits(userId).resultSize(),
        this.repoService.constantsRepo.getConstant(
          ConstantId.FIRST_CREATE_BRACKHIT_NOTIFICATION_BRACKHITS_COUNT,
        ),
        this.repoService.constantsRepo.getConstant(
          ConstantId.SECOND_CREATE_BRACKHIT_NOTIFICATION_BRACKHITS_COUNT,
        ),
      ]);

    if (createdBrackhits > 0) return;

    const notifiableBrackhitCompletions = [
      firstNotificationConst.value,
      secondNotificationConst.value,
    ];

    if (notifiableBrackhitCompletions.includes(completedBrackhits)) {
      const name = `create-brackhit-notification-${userId}-${completedBrackhits}`;
      const constant = await this.repoService.constantsRepo.getConstant(
        ConstantId.CREATE_BRACKHIT_NOTIFICATION_DELAY,
      );
      const ms = constant.value * HOUR;

      const timeout = setTimeout(async () => {
        if (completedBrackhits === firstNotificationConst.value) {
          await this.notificationService.sendFirstCreateBrackhitNotification(userId);
        } else if (completedBrackhits === secondNotificationConst.value) {
          await this.notificationService.sendSecondCreateBrackhitNotification(userId);
        }
      }, ms);

      this.schedulerRegistry.addTimeout(name, timeout);
    }
  }
}
