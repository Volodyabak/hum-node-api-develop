import UAParser from 'ua-parser-js';
import moment from 'moment';
import { capitalize } from 'lodash';
import { CampaignLogAction } from '@database/Models';
import { getS3ImagePrefix } from '../../../Tools/utils/image.utils';

const Action = {
  [CampaignLogAction.CTA_CLICK]: 'CTA',
  [CampaignLogAction.SHARE_WITH_FRIEND_CLICK]: 'Share',
  [CampaignLogAction.SHOPPING_ITEM_CLICK]: 'Shopping Item',
  [CampaignLogAction.DOWNLOAD_IOS_APP_CLICK]: 'Download iOS App',
  [CampaignLogAction.DOWNLOAD_ANDROID_APP_CLICK]: 'Download Android App',
  [CampaignLogAction.TRY_AGAIN_CLICK]: 'Try Again',
  [CampaignLogAction.SUBMIT]: 'Submit',
  [CampaignLogAction.RESUBMIT]: 'Resubmit',
  [CampaignLogAction.CONTENT_PLAY]: 'Content Play',
  [CampaignLogAction.START_BUTTON]: 'Start Button',
  [CampaignLogAction.SHOPPING_ITEM_ONE_CLICK]: 'Shopping Item One',
  [CampaignLogAction.SHOPPING_ITEM_TWO_CLICK]: 'Shopping Item Two',
  [CampaignLogAction.SHOPPING_ITEM_THREE_CLICK]: 'Shopping Item Three',
};

export function getDeviceFromUserAgent(userAgent: string) {
  if (!userAgent) return null;

  const parser = new UAParser(userAgent);
  const device = parser.getDevice();

  if (device.type === 'mobile') {
    return parser.getOS().name;
  } else if (!device.type) {
    return 'Desktop';
  }

  return capitalize(device.type);
}

export function parseLocation(city: string, region: string, country: string) {
  if (country === 'United States') {
    return `${city}, ${region}`;
  }
  return country;
}

export function parseTime(createdAt) {
  return moment.utc(createdAt).local().format('MM-DD-YYYY hh:mm A');
}

export function parseAction(action: CampaignLogAction) {
  return Action[action];
}

export function formatAnalyticsData(data: any[]) {
  data.forEach((el) => {
    el['device'] = getDeviceFromUserAgent(el.userAgent);
    el['time'] = parseTime(el['createdAt']);
    el['actions'] = el['actions']
      .split(',')
      .map((action: string) => parseAction(action as CampaignLogAction));
    el['location'] = parseLocation(el.city, el.region, el.country);
  });
}

export function getImagesKeys(
  campaignId: number,
  newCampaignId: number,
  data: Record<string, any>,
) {
  const keys: Array<{ oldKey: string; newKey: string }> = [];
  const urlPrefix = getS3ImagePrefix();
  const imagePrefix = 'campaigns/' + campaignId;
  const newImagePrefix = 'campaigns/' + newCampaignId;

  function iterateDataObject(data: Record<string, any>) {
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'object' && data[key] !== null) {
        iterateDataObject(data[key]);
      } else if (typeof data[key] === 'string' && data[key].includes(imagePrefix)) {
        keys.push({
          oldKey: data[key].replace(urlPrefix, ''),
          newKey: data[key].replace(urlPrefix, '').replace(imagePrefix, newImagePrefix),
        });
      }
    });
  }
  iterateDataObject(data);

  return keys;
}
