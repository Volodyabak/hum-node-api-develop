import {
  ALL_SETTINGS_OFF_MSG,
  ALL_SETTINGS_ON_MSG,
  INCONSISTENT_STATE_ERR_MSG,
  SettingNames,
  SettingStates,
  SettingTypes,
  SettingTypeToNameMap,
} from '../../modules/app-settings/constants';
import { AppSettingsModel } from '../../../database/Models/AppSettingsModel';
import { BadRequestError } from '../../Errors';
import {
  AppSettingsResponseDto,
  AppSettingsStateDto,
} from '../../modules/app-settings/dto/app-settings.dto';

class AppSettingsService {
  public async toggleAppSetting(type: SettingTypes): Promise<AppSettingsResponseDto> {
    if (type === undefined) {
      return AppSettingsService.toggleAllSettingsState();
    } else {
      const setting = await AppSettingsService.getSettingName(type);
      return AppSettingsService.toggleSettingState(setting);
    }
  }

  public async getAppSettingsState(): Promise<AppSettingsStateDto> {
    const [showImages, showPreview] = await Promise.all([
      AppSettingsService.getSettingState(SettingNames.SHOW_ALBUM_IMAGES),
      AppSettingsService.getSettingState(SettingNames.ALLOW_TRACK_PREVIEWS),
    ]);

    return {
      showAlbumImages: showImages,
      showTrackPreviews: showPreview,
    };
  }

  private static async toggleSettingState(setting: SettingNames): Promise<AppSettingsResponseDto> {
    const state = await AppSettingsService.getSettingState(setting);

    if (state === SettingStates.ON) {
      return AppSettingsService.switchSettingOff(setting);
    } else {
      return AppSettingsService.switchSettingOn(setting);
    }
  }

  private static async toggleAllSettingsState(): Promise<AppSettingsResponseDto> {
    const state = await AppSettingsService.validateAllSettingsState();

    if (state === SettingStates.ON) {
      await AppSettingsModel.query().update({ state: SettingStates.OFF });
      return {
        message: ALL_SETTINGS_OFF_MSG,
      };
    } else {
      await AppSettingsModel.query().update({ state: SettingStates.ON });
      return {
        message: ALL_SETTINGS_ON_MSG,
      };
    }
  }

  private static async switchSettingOn(setting: SettingNames): Promise<AppSettingsResponseDto> {
    await AppSettingsModel.query().update({ state: SettingStates.ON }).where({ setting });
    return {
      message: `App setting '${setting}' has been turned on`,
    };
  }

  private static async switchSettingOff(setting: SettingNames): Promise<AppSettingsResponseDto> {
    await AppSettingsModel.query().update({ state: SettingStates.OFF }).where({ setting });
    return {
      message: `App setting '${setting}' has been turned off`,
    };
  }

  private static getSettingName(type: SettingTypes): SettingNames {
    if (SettingTypeToNameMap.has(type)) {
      return SettingTypeToNameMap.get(type);
    } else {
      throw new Error('Setting with such type does not exist!');
    }
  }

  private static async validateAllSettingsState(): Promise<SettingStates> {
    const data = await AppSettingsModel.query();
    const sum = data.reduce((prev, curr) => prev + curr.state, 0);

    if (sum !== 0 && sum !== data.length) {
      throw new BadRequestError(INCONSISTENT_STATE_ERR_MSG);
    }

    return sum === 0 ? SettingStates.OFF : SettingStates.ON;
  }

  private static async getSettingState(setting: SettingNames): Promise<SettingStates> {
    const data = await AppSettingsModel.query().where({ setting }).first();
    return data.state;
  }
}

const instance = new AppSettingsService();
export { instance as AppSettingsService };
