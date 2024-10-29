import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { SpotifyModule } from './modules/spotify/spotify.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { RabbitmqModule } from './modules/rabbitmq/rabbitmq.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BrackhitsModule } from './modules/brackhits/brackhits.module';
import { AuthUserMiddleware } from './midlleware/auth-user.middleware';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FriendsModule } from './modules/friends/friends.module';
import { UsersModule } from './modules/users/users.module';
import { AppSettingsModule } from './modules/app-settings/app-settings.module';
import { TracksModule } from './modules/tracks/tracks.module';
import { ArtistsModule } from './modules/artists/artists.module';
import { FacebookModule } from './modules/facebook/facebook.module';
import { AuthModule } from './modules/auth/auth.module';
import { CampaignModule } from './modules/campaigns/campaign.module';
import { AwsModule } from './modules/aws/aws.module';
import { CompaniesModule } from './modules/companies/companiesModule';
import { TestsModule } from './modules/tests/tests.module';
import { OneSignalModule } from './modules/one-signal/one-signal.module';
import { FeedModule } from './modules/feed/feed.module';
import { AppleMusicModule } from './modules/apple-music/apple-music.module';
import { EventsModule } from './modules/events/events.module';
import { BallotsModule } from './modules/ballots/ballots.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { getIp } from './Tools/utils/utils';
import { TriviaModule } from './modules/trivia/trivia.module';
import { AppEventsListenerModule } from './modules/app-events-listener/app-events-listener.module';
import { UserAgentsMiddleware } from './midlleware/user-agents.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { MailchimpModule } from './modules/mailchimp/mailchimp.module';

@Module({
  controllers: [AppController],
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 50,
        generateKey: (req: any) => getIp(req.switchToHttp().getRequest()),
      },
    ]),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
    TasksModule,
    SpotifyModule,
    NotificationsModule,
    RabbitmqModule,
    AnalyticsModule,
    BrackhitsModule,
    FriendsModule,
    UsersModule,
    AppSettingsModule,
    TracksModule,
    FacebookModule,
    ArtistsModule,
    AuthModule,
    CampaignModule,
    AwsModule,
    CompaniesModule,
    TestsModule,
    OneSignalModule,
    FeedModule,
    AppleMusicModule,
    EventsModule,
    BallotsModule,
    TriviaModule,
    AppEventsListenerModule,
    MailchimpModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    // todo: uncomment when get rid of old express server
    // consumer.apply(AppLoggerMiddleware).forRoutes('*');

    consumer
      .apply(UserAgentsMiddleware, AuthUserMiddleware)
      .exclude(
        { path: '/user', method: RequestMethod.GET },
        { path: '/health', method: RequestMethod.GET },
        { path: '/auth/signup', method: RequestMethod.POST },
        { path: '/auth/login', method: RequestMethod.POST },
        { path: '/auth/login/company', method: RequestMethod.POST },
        { path: '/auth/mailchimp', method: RequestMethod.GET },
        { path: '/auth/mailchimp/callback', method: RequestMethod.GET },
        { path: '/spotify/authorize', method: RequestMethod.GET },
        { path: '/spotify/code', method: RequestMethod.POST },
        { path: '/campaigns', method: RequestMethod.GET },
        { path: '/campaigns/:campaignId/submit', method: RequestMethod.POST },
        { path: '/campaigns/:campaignId/user', method: RequestMethod.POST },
        { path: '/campaigns/:campaignId/log', method: RequestMethod.POST },
        { path: '/campaigns/:campaignId/share-slugs', method: RequestMethod.POST },
        { path: '/campaigns/:campaignId/share-slugs/log', method: RequestMethod.POST },
        { path: '/campaigns/:campaignId/brackhits/:brackhitId/choices', method: RequestMethod.GET },
        { path: '/v2/campaigns', method: RequestMethod.GET },
        { path: '/ballots/:ballotId', method: RequestMethod.GET },
        { path: '/ballots/:ballotId/summary', method: RequestMethod.GET },
        { path: '/v2/ballots/:id', method: RequestMethod.GET },
        { path: '/v2/ballots/:id/summary', method: RequestMethod.GET },
        { path: '/user/ballots/:ballotId', method: RequestMethod.POST },
        { path: '/trivia/:id', method: RequestMethod.GET },
        { path: '/v2/trivias/:id', method: RequestMethod.GET },
        { path: '/qr-codes/:id', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
