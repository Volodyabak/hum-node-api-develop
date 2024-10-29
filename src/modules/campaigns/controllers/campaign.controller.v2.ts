import { Controller, Get, Param, Query } from '@nestjs/common';
import { CampaignServiceV2 } from '../services/campaign.service.v2';
import { CommonQueryDto } from '../../../common/dto/query/query.dto';
import { CampaignGameService } from '../services/campaign-game.service';
import { CampaignAnalyticsService } from '../services/campaign-analytics.service';

@Controller('/v2/campaigns')
export class CampaignControllerV2 {
  constructor(
    private readonly campaignService: CampaignServiceV2,
    private readonly campaignGameService: CampaignGameService,
    private readonly analyticsService: CampaignAnalyticsService,
  ) {}

  @Get('')
  async findAll(@Query() query: CommonQueryDto) {
    const [campaigns, total] = await this.campaignService.findAll(query);

    await Promise.all(
      campaigns.map(async (campaign) => {
        const [summary] = await Promise.all([
          this.analyticsService.getCampaignSummary(campaign.id),
          this.campaignGameService.populateCampaignGame(campaign),
        ]);
        campaign['submissions'] = summary.submissions;
      }),
    );

    return {
      data: campaigns,
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

  @Get('/:id')
  async findById(@Param('id') id: number) {
    const campaign = await this.campaignService.findById(id);
    await this.campaignGameService.populateCampaignGame(campaign);
    return { data: campaign };
  }
}
