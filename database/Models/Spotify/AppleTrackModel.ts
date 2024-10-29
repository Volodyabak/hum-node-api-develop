import { Model } from 'objection';

export class AppleTrackModel extends Model {
  id: number;
  trackKey: number;
  trackName: string;
  trackNumber: number;
  isrc_id: number;
  isrc: string;
  trackPreview: string;
  lastChecked: Date;

  static get tableName() {
    return 'ean_collection.apple_track';
  }

  static get idColumn() {
    return 'id';
  }

  static tableNameWithAlias(alias: string): string {
    return AppleTrackModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {};
  }

  static get callbacks() {
    return {
      joinOnTrackKey(from: string, to: string) {
        return function () {
          this.on(`${from}.track_key`, `${to}.track_key`);
        };
      },

      joinOnIsrc(from: string, to: string) {
        return function () {
          this.on(`${from}.isrc`, `${to}.isrc`);
        };
      },
    };
  }
}
