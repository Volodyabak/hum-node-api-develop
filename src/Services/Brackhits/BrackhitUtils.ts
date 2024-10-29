import { BrackhitModel } from 'database/Models/BrackhitModel';
import { S3Service } from '../../modules/aws/services/s3.service';

const MIN_BRACKHIT_COMPLETIONS = 2;
const MIN_HOT_TAKE_COMPLETIONS = 100;
const HOT_TAKE_VOTE_SHARE = 0.25;
export const ARTISTORY_NAME = 'artistory';

const BRACKHIT_TYPE = {
  TRACK: 'track',
  ARTIST: 'artist',
  THEME: 'theme',
};

const BRACKHIT_TYPE_ID = {
  TRACK: 1,
  ARTIST: 2,
  THEME: 3,
};

const USER_STATUS = {
  NONE: 'none',
  IN_PROGRESS: 'in progress',
  COMPLETED: 'completed',
  RESULTS: 'results',
};

export class BrackhitUtils {
  brackhitTypeId;
  userStatus;
  minBrackhitCompletions;
  minHotTakeCompletions;
  hotTakeVoteShare;
  artistory;
  private s3Service: S3Service;

  constructor() {
    this.brackhitTypeId = BRACKHIT_TYPE_ID;
    this.userStatus = USER_STATUS;
    this.minBrackhitCompletions = MIN_BRACKHIT_COMPLETIONS;
    this.minHotTakeCompletions = MIN_HOT_TAKE_COMPLETIONS;
    this.hotTakeVoteShare = HOT_TAKE_VOTE_SHARE;
    this.artistory = ARTISTORY_NAME;
    this.s3Service = new S3Service();
  }

  parseUserBrackhits(brackhits: (BrackhitModel & { isComplete: boolean })[]): any[] {
    return brackhits.map((b) => ({
      brackhitId: b.brackhitId,
      brackhitName: b.name,
      brackhitImage: b.thumbnail,
      isComplete: !!b.isComplete,
    }));
  }

  isTrackBrackhit(type) {
    return type === BRACKHIT_TYPE.TRACK || type === BRACKHIT_TYPE.THEME;
  }

  isArtistBrackhit(type) {
    return type === BRACKHIT_TYPE.ARTIST;
  }

  getSeedForTrackIndex(trackIndex) {
    if (trackIndex === 0) return 1;
    if (trackIndex === 1) return 16;
    if (trackIndex === 2) return 8;
    if (trackIndex === 3) return 9;
    if (trackIndex === 4) return 5;
    if (trackIndex === 5) return 12;
    if (trackIndex === 6) return 4;
    if (trackIndex === 7) return 13;
    if (trackIndex === 8) return 3;
    if (trackIndex === 9) return 14;
    if (trackIndex === 10) return 6;
    if (trackIndex === 11) return 11;
    if (trackIndex === 12) return 7;
    if (trackIndex === 13) return 10;
    if (trackIndex === 14) return 2;
    if (trackIndex === 15) return 15;
  }

  seeding(numPlayers: number) {
    const rounds = Math.log(numPlayers) / Math.log(2) - 1;
    let pls = [1, 2];
    for (let i = 0; i < rounds; i++) {
      pls = nextLayer(pls);
    }
    return pls;
    function nextLayer(pls) {
      const out = [];
      const length = pls.length * 2 + 1;
      pls.forEach(function (d) {
        out.push(d);
        out.push(length - d);
      });
      return out;
    }
  }
}
