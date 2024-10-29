export enum FacebookEventName {
  AddPaymentInfo = 'AddPaymentInfo',
  AddToCart = 'AddToCart',
  AddToWishlist = 'AddToWishlist',
  CompleteRegistration = 'CompleteRegistration',
  Contact = 'Contact',
  CustomizeProduct = 'CustomizeProduct',
  Donate = 'Donate',
  FindLocation = 'FindLocation',
  InitiateCheckout = 'InitiateCheckout',
  Lead = 'Lead',
  Purchase = 'Purchase',
  Schedule = 'Schedule',
  Search = 'Search',
  StartTrial = 'StartTrial',
  SubmitApplication = 'SubmitApplication',
  Subscribe = 'Subscribe',
  ViewContent = 'ViewContent',
  CreateUser = 'CreateUser',
  ConnectSpotify = 'ConnectSpotify',
  ConnectSpotifyFree = 'ConnectSpotifyFree',
  ConnectSpotifyPremium = 'ConnectSpotifyPremium',
  CreateBrackhit = 'CreateBrackhit',
  CompleteBrackhit = 'CompleteBrackhit',
  CommentBrackhit = 'CommentBrackhit',
  ReplyBrackhitComment = 'ReplyBrackhitComment',
}

export interface FacebookEventUserData {
  emails: string[];
  firstName: string;
  lastName: string;
}

export interface FacebookEventPayload {
  endpoint: string;
  userData: FacebookEventUserData;
  eventName: FacebookEventName;
}
