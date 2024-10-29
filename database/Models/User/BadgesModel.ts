import { Model } from 'objection';
import { UserBadgesModel } from './UserBadgesModel';
import { ApiProperty } from '@nestjs/swagger';
import { UserBadgeSection } from '../../../src/modules/friends/constants';
import { IsEnum } from 'class-validator';

export class BadgesModel extends Model {
  @ApiProperty()
  badgeId: number;

  @ApiProperty()
  badge: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: Object.values(UserBadgeSection), example: UserBadgeSection.SHARED })
  @IsEnum(UserBadgeSection)
  section: UserBadgeSection;

  detail: string;

  static get tableName() {
    return 'labl.badges';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      userBadges: {
        relation: Model.HasManyRelation,
        modelClass: UserBadgesModel,
        join: {
          from: 'labl.badges.id',
          to: 'labl.user_badges.badgeId',
        },
      },
    };
  }

  async $afterFind() {
    this.description = this.detail;
  }

  async $beforeInsert() {
    if (this.description) {
      this.detail = this.description;
    }
    this.description = undefined;
  }

  async $beforeUpdate() {
    if (this.description) {
      this.detail = this.description;
    }
    this.description = undefined;
  }
}
