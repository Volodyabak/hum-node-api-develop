import { Injectable } from '@nestjs/common';
import { CampaignUsersData } from '../../campaigns/dto/campaign-user-data.dto';
import { ExportDataToMailchimpDto } from 'src/modules/mailchimp/dto/export-data-toMailchimp.dto';

@Injectable()
export class TransformerService {
  transformMailchimpData(data: CampaignUsersData[]): ExportDataToMailchimpDto[] {
    return data.map((user) => ({
      email: user.email,
      name: user.name,
    }));
  }
}
