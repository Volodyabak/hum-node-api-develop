import { BadRequestException, Injectable } from '@nestjs/common';
import { CampaignUsersData } from '../../campaigns/dto/campaign-user-data.dto';
import { TransformerService } from './transformer.service';
import { MailchimpService } from 'src/modules/mailchimp/services/mailchimp.service';
import { MailchimpBatchResponseDto } from 'src/modules/mailchimp/dto/mailchimp-batch-response.dto';

export enum SyncService {
  MAILCHIMP = 'mailchimp',
}

@Injectable()
export class SyncBridgeService {
  constructor(
    private readonly transformer: TransformerService,
    private readonly mailchimpService: MailchimpService,
  ) {}

  async syncUsers(
    service: SyncService,
    usersData: CampaignUsersData[],
    listId: string,
  ): Promise<MailchimpBatchResponseDto> {
    if (service === SyncService.MAILCHIMP) {
      const transformedData = this.transformer.transformMailchimpData(usersData);
      return this.mailchimpService.syncUsersToMailchimp(transformedData, listId);
    } else {
      throw new BadRequestException(`Unknown sync service: ${service}`);
    }
  }
}
