import { UserRelationship } from '../../friends/constants';

export class UsersUtils {
  static identifyUserRelationshipForSearchUsers(orderNumber: number): UserRelationship {
    if (orderNumber === 1) return UserRelationship.FRIEND;
    if (orderNumber === 2) return UserRelationship.RESPOND;
    if (orderNumber === 3) return UserRelationship.REQUESTED;
    if (orderNumber === 4) return UserRelationship.NONE;
    if (orderNumber === 5) return UserRelationship.SELF;

    return null;
  }
}
