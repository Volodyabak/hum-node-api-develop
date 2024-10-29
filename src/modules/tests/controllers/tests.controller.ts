import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { OneSignalService } from '../../one-signal/services/one-signal.service';
import { OneSignalClient } from '../../one-signal/services/one-signal.client';
import { ScheduledTaskService } from '../../tasks/services/scheduled-task.service';
import { CentralFeedModel } from '../../../../database/Models';
import { FeedSources } from '../../feed/constants/feed.constants';

@Controller('test')
export class TestsController {
  constructor(
    private readonly oneSignalService: OneSignalService,
    private readonly scheduledTaskService: ScheduledTaskService,
    private readonly oneSignalClient: OneSignalClient,
  ) {}

  @Get('/')
  @ApiOperation({
    summary: 'Used for testing',
  })
  @ApiResponse({ status: 200 })
  async test(@Query() query: any, @ResCtx() ctx: ResponseContext): Promise<any> {
    // return CentralFeedModel.query().insertAndFetch({
    //   feedSource: FeedSources.Brackhit,
    //   sourceId: 190,
    //   artistId: null,
    // });
  }

  @Get('/one-signal/feed_push')
  @ApiOperation({
    summary: 'Sets feed_push tag in OS for devices that are returned in query',
  })
  @ApiResponse({ status: 200 })
  async setFeedPushTag(@Query() query: any, @ResCtx() ctx: ResponseContext): Promise<any> {
    // const devices = await UserDevicesModel.query()
    //   .from(
    //     raw(
    //       '(SELECT * \n' +
    //         'FROM ean_collection.`user_devices`\n' +
    //         'WHERE user_id NOT IN \n' +
    //         '\t(SELECT DISTINCT user_id FROM labl.log_feed_items)\n' +
    //         'AND user_id IN \n' +
    //         '    (SELECT user_id FROM labl.user_feed_preferences))',
    //     ).as('sub'),
    //   )
    //   .orderBy('deviceKey')
    //   .offset(query.skip)
    //   .limit(query.take);
    //
    // const results = await Promise.allSettled(
    //   devices.map(async (el) => {
    //     return this.oneSignalClient.editDevice(el.oneSignalId, {
    //       external_user_id: el.userId,
    //       tags: {
    //         feed_push: 1,
    //       },
    //     });
    //   }),
    // );
    //
    // return {
    //   total: devices.length,
    //   results,
    // };
  }

  @Get('/notifications')
  @ApiOperation({
    summary: 'Returns all OS notifications sent in last month',
  })
  @ApiResponse({ status: 200 })
  async notifications(@Query() query: any, @ResCtx() ctx: ResponseContext): Promise<any> {
    // const params = { offset: 0, limit: 50 };
    // const notifications = [];
    // const body = await this.oneSignalClient.viewNotifications(params);
    //
    // do {
    //   const body = await this.oneSignalClient.viewNotifications(params);
    //   const parsed = body.notifications.map((el) => ({
    //     id: el.id,
    //     title: el.headings.en,
    //     message: el.contents.en,
    //     converted: el.converted,
    //     received: el.received,
    //     successful: el.successful,
    //     completedAt: el.completed_at,
    //   }));
    //   notifications.push(...parsed);
    //   params.offset += params.limit;
    // } while (params.offset + params.limit <= body.total_count);
    //
    // return {
    //   total: notifications.length,
    //   notifications,
    // };
  }

  @Get('/notifications/group')
  @ApiOperation({
    summary: 'Returns notifications grouped by title',
  })
  @ApiResponse({ status: 200 })
  async groupNotifications(@Query() query: any, @ResCtx() ctx: ResponseContext): Promise<any> {
    // const data = fs
    //   .readFileSync('C:\\dev\\artistory\\src\\modules\\tests\\files\\notifications.json')
    //   .toString();
    // const json = JSON.parse(data);
    // let minDate = Date.now();
    //
    // const notificationsMap = new Map<string, any>();
    // json.notifications.forEach((el) => {
    //   const key = TestUtils.getCleanNotificationMessageText(el.message);
    //   minDate = el.completedAt && el.completedAt < minDate ? el.completedAt : minDate;
    //
    //   if (notificationsMap.has(key)) {
    //     const value = notificationsMap.get(key);
    //     value.count += 1;
    //     value.clicked += el.converted;
    //     value.confirmed += el.received;
    //     value.sent += el.successful;
    //     value.clickedConfirmedPercent = (value.clicked / value.confirmed) * 100;
    //     value.clickedSentPercent = (value.clicked / value.sent) * 100;
    //     value.confirmedSentPercent = (value.confirmed / value.sent) * 100;
    //     notificationsMap.set(key, value);
    //   } else {
    //     notificationsMap.set(key, {
    //       pattern: key,
    //       title: el.title,
    //       message: el.message,
    //       count: 1,
    //       clicked: el.converted,
    //       confirmed: el.received,
    //       sent: el.successful,
    //       clickedConfirmedPercent: (el.converted / el.received) * 100,
    //       clickedSentPercent: (el.converted / el.successful) * 100,
    //       confirmedSentPercent: (el.received / el.successful) * 100,
    //     });
    //   }
    // });
    //
    // return {
    //   minDate,
    //   results: Array.from(notificationsMap.values()),
    // };
  }
}
