import { Model } from 'objection';
import { SpotifyAlbumModel } from '../Spotify';
import { Relations } from '../../relations/relations';
import { ArtistModel, YoutubeVideoModel } from '../Artist';
import { BrackhitContentModel, CampaignCustomContentNameModel } from '@database/Models';
import { TrackInfoDto } from '../../../src/modules/tracks/tracks.dto';
import { VimeoVideoInfoDto } from '../../../src/modules/brackhits/dto/brackhits.dto';
import { CustomContentModel } from '@database/Models/campaign/custom-content.model';
import { TiktokModel } from '@database/Models/tiktok.model';
import { YoutubeClipModel } from '@database/Models/Artist/YoutubeClipModel';

export class BallotMatchupsModel extends Model {
  id: number;
  ballotId: number;
  roundId: number;
  choiceId: number;

  choiceContent?: BrackhitContentModel;
  content?:
    | TrackInfoDto
    | SpotifyAlbumModel
    | ArtistModel
    | YoutubeVideoModel
    | VimeoVideoInfoDto
    | TiktokModel
    | CustomContentModel
    | YoutubeClipModel;
  contentDetails?: CampaignCustomContentNameModel;

  static get tableName() {
    return 'labl.ballot_matchups';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.ChoiceContent]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitContentModel,
        join: {
          from: `${this.tableName}.choiceId`,
          to: `${BrackhitContentModel.tableName}.choiceId`,
        },
      },
    };
  }
}
