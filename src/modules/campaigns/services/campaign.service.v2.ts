import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorConst } from '../../../constants';
import { RepositoryService } from '../../repository/services/repository.service';
import { CommonQueryDto } from '../../../common/dto/query/query.dto';
import { parseCommonDtoKnex } from '../../../common/query/filters';

@Injectable()
export class CampaignServiceV2 {
  constructor(private readonly repository: RepositoryService) {}

  async findAll(query: CommonQueryDto) {
    const campaignsQB = this.repository.campaign.findCampaigns({});
    parseCommonDtoKnex(campaignsQB, query);

    const totalQB = campaignsQB.clone().resultSize();
    return Promise.all([campaignsQB, totalQB]);
  }

  async findById(id: number) {
    const campaign = await this.repository.campaign.findCampaign({ id });
    if (!campaign) {
      throw new NotFoundException(ErrorConst.CAMPAIGN_NOT_FOUND);
    }

    return campaign;
  }
}
