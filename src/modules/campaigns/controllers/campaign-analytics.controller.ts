import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiRes } from '../../../common/dto/api';
import {
  CampaignSummaryOutput,
  DeviceDataOutput,
  TrafficRegionsOutput,
  UserOutput,
} from '../dto/output/analytics';
import { CampaignAnalyticsService } from '../services/campaign-analytics.service';
import { CommonQueryDto } from '../../../common/dto/query/query.dto';

@ApiTags('Campaign Analytics')
@Controller('campaigns/:id/analytics')
export class CampaignAnalyticsController {
  constructor(private readonly campaignAnalyticsService: CampaignAnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get campaign summary statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns summary of unique visitors, submissions, session length, etc.',
  })
  async getSummary(@Param('id') id: number): Promise<ApiRes<CampaignSummaryOutput>> {
    const summary = await this.campaignAnalyticsService.getCampaignSummary(id);
    return { data: summary };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user data including location and score information' })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of users with their respective scores and submission details.',
  })
  async getUsers(
    @Param('id') id: number,
    @Query() query: CommonQueryDto,
  ): Promise<ApiRes<UserOutput[]>> {
    const [users, total] = await this.campaignAnalyticsService.getUsers(id, query);
    return {
      data: users,
      meta: {
        pagination: {
          page: query.pagination.page,
          pageSize: query.pagination.pageSize,
          pageCount: Math.ceil(+total / query.pagination.pageSize),
          total,
        },
      },
    };
  }

  @Get('device-data')
  @ApiOperation({ summary: 'Get device type and mobile OS statistics' })
  @ApiResponse({
    status: 200,
    description:
      'Returns statistics for device types (mobile, desktop, tablet) and mobile OS (iOS, Android, etc.).',
  })
  async getDeviceData(@Param('id') id: number): Promise<ApiRes<DeviceDataOutput>> {
    const deviceData = (await this.campaignAnalyticsService.getDeviceData(id)) as any;
    return { data: deviceData };
  }

  @Get('traffic-regions')
  @ApiOperation({ summary: 'Get traffic sources and users by regions' })
  @ApiResponse({
    status: 200,
    description: 'Returns site visit data, traffic sources, and user distribution by regions.',
  })
  async getTrafficRegions(@Param('id') id: number): Promise<ApiRes<TrafficRegionsOutput>> {
    const trafficRegions = await this.campaignAnalyticsService.getTrafficRegions(id);
    return { data: trafficRegions };
  }

  @Get('quiz-results')
  @ApiOperation({ summary: 'Get quiz results including score distribution and top answers' })
  @ApiResponse({
    status: 200,
    description: 'Returns score distribution and top answers for the campaign quiz.',
  })
  async getQuizResults(@Param('id') id: number) {
    const quizResults = await this.campaignAnalyticsService.getQuizResults(id);
    return { data: quizResults as any };
  }

  @Get('top-spotify')
  @ApiOperation({
    summary: 'Get Spotify top tracks and artists for campaign users',
    description:
      'Returns the current and long-term top Spotify tracks and artists for users in the specified campaign.',
  })
  async getTopSpotify(@Param('id') id: number) {
    const topSpotify = await this.campaignAnalyticsService.getTopSpotify(id);
    return { data: topSpotify as any };
  }
}
