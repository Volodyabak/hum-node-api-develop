import { Injectable } from '@nestjs/common';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { ExportDataToMailchimpDto } from '../dto/export-data-toMailchimp.dto';
import {
  BatchDetailsMailchimp,
  MailchimpBatchResponseDto,
  UserDetailsMailchimp,
} from '../dto/mailchimp-batch-response.dto';
import { CreateListDto } from '../dto/create-list.dto';
import { MailchimpListResponseDto } from '../dto/mailchimp-list-response.dto';
import { SyncService } from 'src/modules/sync-bridge/services/sync-bridge.service';

@Injectable()
export class MailchimpService {
  constructor() {
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });
  }

  async getAllLists() {
    const response = await mailchimp.lists.getAllLists();
    return response.lists;
  }

  async createList(createListDto: CreateListDto): Promise<MailchimpListResponseDto> {
    const response = await mailchimp.lists.createList({
      name: createListDto.listName,
      contact: createListDto.contact,
      permission_reminder: createListDto.permission_reminder,
      campaign_defaults: createListDto.campaign_defaults,
      email_type_option: true,
    });

    return {
      id: response.id,
      name: response.name,
    };
  }

  async syncUsersToMailchimp(
    users: ExportDataToMailchimpDto[],
    listId: string,
  ): Promise<MailchimpBatchResponseDto> {
    try {
      const mergeFields = await mailchimp.lists.getListMergeFields(listId);
      const existingFieldNames = mergeFields.merge_fields.map((field) => field.name);

      if (!existingFieldNames.includes('NAME')) {
        await mailchimp.lists.addListMergeField(listId, {
          name: 'NAME',
          type: 'text',
        });
      }

      const operations = users.map((user) => ({
        method: 'POST',
        path: `/lists/${listId}/members`,
        body: JSON.stringify({
          email_address: user.email,
          status: 'subscribed',
          merge_fields: {
            NAME: user.name,
            EMAIL: user.email,
          },
        }),
      }));

      const batchResponse = await mailchimp.batches.start({ operations });

      const userResponses: UserDetailsMailchimp[] = users.map((user) => ({
        email: user.email,
        status: 'subscribed',
      }));

      const batchDetails: BatchDetailsMailchimp = {
        batchId: batchResponse.id,
        totalOperations: batchResponse.total_operations,
        finishedOperations: batchResponse.finished_operations,
        erroredOperations: batchResponse.errored_operations,
      };

      return {
        status: 'success',
        service: SyncService.MAILCHIMP,
        users: userResponses,
        batchDetails,
      };
    } catch (error) {
      const failedUsers: UserDetailsMailchimp[] = users.map((user) => ({
        email: user.email,
        status: 'failed',
        error: error.message,
      }));

      return {
        status: 'failure',
        service: SyncService.MAILCHIMP,
        users: failedUsers,
      };
    }
  }
}
