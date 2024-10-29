import { Model } from 'objection';
import { SettingNames, SettingStates } from '../../src/modules/app-settings/constants';

export class AppSettingsModel extends Model {
  setting: SettingNames;
  state: SettingStates;

  static get tableName() {
    return 'labl.app_settings';
  }

  static get idColumn() {
    return 'setting';
  }
}
