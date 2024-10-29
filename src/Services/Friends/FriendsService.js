const Tools = require('../../Tools');
const {
  GET_INCOMING_FRIEND_REQUESTS,
} = require('../../Queries');
const { UserService } = require('../User/UserService');

const FRIEND_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DENIED: 'denied',
};

const USER_RELATIONSHIP = {
  SELF: 'self',
  NONE: 'none',
  FRIEND: 'friend',
  RESPOND: 'respond',
  REQUESTED: 'requested',
};

module.exports.FRIEND_REQUEST_STATUS = FRIEND_REQUEST_STATUS;

module.exports.getIncomingFriendRequests = async (userId) => {
  return Tools.promisifiedQuery(
    GET_INCOMING_FRIEND_REQUESTS,
    {
      userId,
    },
    'Friends Service getIncomingFriendRequests Error: ',
  );
};

module.exports.getUserFriendStatus = async (userId, friendId) => {
  if (userId === friendId) {
    return USER_RELATIONSHIP.SELF;
  }

  const [incomingFriendRequest, outgoingFriendRequest] = await Promise.all([
    UserService.getUserFriendRequest(friendId, userId),
    UserService.getUserFriendRequest(userId, friendId),
  ]);

  let relationship = USER_RELATIONSHIP.NONE;
  if (
    (incomingFriendRequest && incomingFriendRequest.status === FRIEND_REQUEST_STATUS.ACCEPTED) ||
    (outgoingFriendRequest && outgoingFriendRequest.status === FRIEND_REQUEST_STATUS.ACCEPTED)
  ) {
    relationship = USER_RELATIONSHIP.FRIEND;
  } else if (
    incomingFriendRequest &&
    incomingFriendRequest.status === FRIEND_REQUEST_STATUS.PENDING
  ) {
    relationship = USER_RELATIONSHIP.RESPOND;
  } else if (
    outgoingFriendRequest &&
    outgoingFriendRequest.status === FRIEND_REQUEST_STATUS.PENDING
  ) {
    relationship = USER_RELATIONSHIP.REQUESTED;
  }

  return relationship;
};
