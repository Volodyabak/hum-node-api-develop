import { Injectable, Logger } from '@nestjs/common';
import { OneSignalClient } from './one-signal.client';
import { BrackhitsService } from '../../brackhits/services/brackhits.service';
import { UserDevicesModel } from '../../../../database/Models';
import { BrackhitTags } from '../../brackhits/constants/brackhits-hub.constants';
import { DeviceType, UserEmailDevice } from '../interfaces/one-signal.interface';

@Injectable()
export class OneSignalService {
  private readonly _logger = new Logger(OneSignalService.name);

  constructor(
    private readonly oneSignalClient: OneSignalClient,
    private readonly brackhitsService: BrackhitsService,
  ) {}

  // if player with provided email already exists, then update operation is performed
  async addUserEmailDevice(user: UserEmailDevice) {
    return this.oneSignalClient.addDevice({
      identifier: user.email,
      device_type: DeviceType.Email,
      external_user_id: user.userId,
    });
  }

  async handleMadnessBrackhitCompleted(brackhitId: number, userId: string): Promise<void> {
    const [brackhitTags, userDevices] = await Promise.all([
      this.brackhitsService.getBrackhitTags(brackhitId),
      UserDevicesModel.query().where('userId', userId),
    ]);

    if (userDevices.length === 0) {
      this._logger.debug(
        `[OneSignalService::handleMadnessBrackhitCompleted]: User that completed a brackhit does not have a device | userId=${userId}, brackhitId=${brackhitId}`,
      );
    }

    if (brackhitTags.includes(BrackhitTags.Madness)) {
      await Promise.all(
        userDevices.map((el) =>
          this.oneSignalClient.editDevice(el.oneSignalId, {
            external_user_id: el.userId,
            tags: {
              madness: 1,
            },
          }),
        ),
      );
    }
  }
}
