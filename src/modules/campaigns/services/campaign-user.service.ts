import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CampaignUserDto } from '../dto/campaign.dto';
import { RepositoryService } from '../../repository/services/repository.service';
import { db } from '@database/knex';
import { CampaignUsersData } from '../dto/campaign-user-data.dto';
import { SyncBridgeService, SyncService } from '../../sync-bridge/services/sync-bridge.service';
import { DataAttributes } from '@database/Models/campaign/campaign-user-data.model';

@Injectable()
export class CampaignUserService {
  constructor(
    private readonly repository: RepositoryService,
    private readonly syncBridgeService: SyncBridgeService,
  ) {}

  async findOrCreateCampaignUser(campaignId: number, data: CampaignUserDto) {
    let campaignUser = await this.repository.campaign.findCampaignUser({ email: data.email });

    if (!campaignUser) {
      campaignUser = await this.createCampaignUser(campaignId, data);
    } else {
      campaignUser = await this.updateCampaignUser(campaignUser, data);
    }

    return campaignUser;
  }

  async linkUserToCampaign(campaignId: number, userId: string) {
    await this.repository.campaign.linkUserToCampaign({ campaignId, userId }).onConflict().ignore();
  }

  async syncUserData(campaignId: number, service: SyncService, listId: string) {
    const usersData: CampaignUsersData[] = await db('labl.campaign_logs as cl')
      .join('labl.campaign_user_agents as cua', 'cl.user_agent_id', 'cua.id')
      .join('labl.campaign_user as cu', 'cu.user_id', 'cua.campaign_user_id')
      .where('cl.campaign_id', campaignId)
      .whereNotNull('cua.campaign_user_id')
      .groupBy('cu.email')
      .select('cua.*', 'cu.*');
    return this.syncBridgeService.syncUsers(service, usersData, listId);
  }

  async createCampaignUser(campaignId: number, data: CampaignUserDto) {
    const userId = uuidv4();
    const campaignUser = await this.repository.campaign.insertCampaignUser({
      userId: userId,
      email: data.email,
    });

    await this.createCampaignUserData(campaignId, userId, {
      email: data.email,
      phone: data.phoneNumber,
      zip: data.zip,
      name: data.name,
      instagram: data.instagramUsername,
    });

    return campaignUser;
  }

  async createCampaignUserData(campaignId: number, userId: string, data: any) {
    const attributes = [];
    const common = { campaignId, campaignUserId: userId };

    if (data.email) {
      attributes.push({ ...common, attribute: DataAttributes.EMAIL, value: data.email });
    }
    if (data.phone) {
      attributes.push({ ...common, attribute: DataAttributes.PHONE, value: data.phoneNumber });
    }
    if (data.zip) {
      attributes.push({ ...common, attribute: DataAttributes.ZIP, value: data.zip });
    }
    if (data.name) {
      attributes.push({ ...common, attribute: DataAttributes.NAME, value: data.name });
    }
    if (data.instagram) {
      attributes.push({
        ...common,
        attribute: DataAttributes.INSTAGRAM,
        value: data.instagramUsername,
      });
    }
    if (data.country) {
      attributes.push({ ...common, attribute: DataAttributes.COUNTRY, value: data.country });
    }
    if (data.region) {
      attributes.push({ ...common, attribute: DataAttributes.REGION, value: data.region });
    }
    if (data.city) {
      attributes.push({ ...common, attribute: DataAttributes.CITY, value: data.city });
    }

    await Promise.all(
      attributes.map((attr) => this.repository.campaign.insertCampaignUserData(attr)),
    );
  }

  private async updateCampaignUser(campaignUser: any, data: CampaignUserDto) {
    return campaignUser.$query().patchAndFetch({ ...data });
  }
}
