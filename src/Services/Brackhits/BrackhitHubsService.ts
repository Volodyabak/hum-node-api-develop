import {
  FILTER_NOT_COMPLETED_BRACKHITS,
} from '../../Queries';
import { BrackhitsServiceExpress } from './BrackhitsServiceExpress';
import { BrackhitUtils } from './BrackhitUtils';
import { db } from '../../../database/knex';
import Tools from '../../Tools';
import { UserService } from '../User/UserService';

class BrackhitHubsService {
  utils: BrackhitUtils;
  userService: typeof UserService;
  brackhitService: typeof BrackhitsServiceExpress;

  constructor() {
    this.utils = new BrackhitUtils();
    this.userService = UserService;
    this.brackhitService = BrackhitsServiceExpress;
  }

  async getForYouBrackhits(userId, userTime, take) {
    const userArtists = await this.userService.getUserArtists(userId);
    const artistBrackhits = await this.brackhitService.getBrackhitsContainingArtist(
      userArtists.artistIds,
      userTime,
    );

    return this.filterNotCompletedBrackhits(artistBrackhits, userId, userTime, take);
  }

  async getTagsForHubData(hubId) {
    const tags = await this.getTagsForHub(hubId);
    return {
      hubId,
      tags,
    };
  }

  async getTagsForHub(genre_id) {
    return db({ bgt: 'labl.brackhit_genre_tag' })
      .select({
        tagId: 'bgt.tag_id',
        name: 'btt.tag',
      })
      .join({ btt: 'labl.brackhit_tag_type' }, 'btt.tag_id', 'bgt.tag_id')
      .where({ genre_id });
  }

  async filterNotCompletedBrackhits(brackhits, userId, userTime, take) {
    if (brackhits.length === 0) return [];

    const brackhitIds = brackhits.map((b) => b.brackhitId);

    return Tools.promisifiedQuery(
      FILTER_NOT_COMPLETED_BRACKHITS,
      {
        brackhitIds: [brackhitIds],
        userId,
        userTime,
        take,
      },
      'BrackhitHubsService filterNotCompletedBrackhits() FILTER_NOT_COMPLETED_BRACKHITS error: ',
    );
  }
}

const instance = new BrackhitHubsService();
export { instance as BrackhitHubsService };
