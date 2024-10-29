import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AWSUsersModel } from '../../../../database/Models';
import { OneSignalService } from '../services/one-signal.service';
import { AddEmailsQueryDto } from '../dto/one-signal.api-dto';
import { NotificationService } from '../../notifications/services/notification.service';
import { RepositoryService } from '../../repository/services/repository.service';

@Controller('/one-signal')
@ApiTags('One Signal')
@ApiBearerAuth()
export class OneSignalController {
  constructor(
    private readonly oneSignalService: OneSignalService,
    private readonly notificationService: NotificationService,
    private readonly repoService: RepositoryService,
  ) {}

  @Post('/pending-notifications')
  @ApiOperation({
    summary: 'Sends pending request reminder notification to specified users',
  })
  @ApiResponse({ status: 200 })
  async sendPendingRequestsNotifications(@Body() body: any) {
    return Promise.allSettled(
      body.userIds.map(async (userId) => {
        return this.notificationService.sendPendingRequestsReminderNotification(userId);
      }),
    );
  }

  @Post('/emails')
  @ApiOperation({
    summary: 'Adds user emails to One Signal',
  })
  @ApiResponse({ status: 200 })
  async addUserEmails(@Query() query: AddEmailsQueryDto) {
    const [users, total] = await Promise.all([
      AWSUsersModel.query().limit(query.take).offset(query.skip),
      AWSUsersModel.query().resultSize(),
    ]);
    const results = await Promise.allSettled(
      users.map(async (u) =>
        this.oneSignalService.addUserEmailDevice({
          userId: u.sub,
          email: u.email,
        }),
      ),
    );

    return {
      skip: query.skip,
      take: query.take,
      total,
      results,
    };
  }
}
