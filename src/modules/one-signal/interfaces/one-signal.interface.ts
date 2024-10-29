enum SupportedLanguages {
  EN = 'en',
  UA = 'ua',
}

export interface UserEmailDevice {
  userId: string;
  email: string;
}

export enum DeviceType {
  iOS = 0,
  Android = 1,
  Amazon = 2,
  WindowsPhone = 3,
  ChromeApps = 4,
  ChromeWeb = 5,
  Windows = 6,
  Safari = 7,
  Firefox = 8,
  MacOS = 9,
  Alexa = 10,
  Email = 11,
  Huawei = 13,
  SMS = 14,
}

export interface CreateNotificationResponseBody {
  id: string;
}

export interface AddDeviceResponseBody {
  success: boolean;
  id: string;
}

interface ActionButton {
  id: string;
  text: string;
  icon: string;
}

export interface AddDevice {
  /**
   * Your OneSignal App Id.
   */
  app_id: string;
  /**
   * The device platform.
   */
  device_type: DeviceType;
  /**
   * Recommended For Push Notifications, this is the Push Token Identifier from Google or Apple<br>
   * Email Addresses: set the full email address email@email.com and make sure to set device_type to 11<br>
   * Phone Numbers: set the E.164 format and make sure to set device_type to 14.
   */
  identifier?: string;
  /**
   * Only required if you have enabled Identity Verification and device_type is 11 (Email) or 14 SMS (coming soon).
   */
  identifier_auth_hash?: string;
  /**
   * This is used in deciding whether to use your iOS Sandbox or Production push certificate when sending a push when both have been uploaded. Set to the iOS provisioning profile that was used to build your app. 1 = Development 2 = Ad-Hoc Omit this field for App Store & Test Flight builds.
   */
  test_type?: string;
  /**
   * Recommended Language code. Typically, lower case two letters, except for Chinese where it must be one of zh-Hans or zh-Hant. Example: en
   */
  language?: string;
  /**
   * A custom user ID
   */
  external_user_id?: string;
  /**
   * Only required if you have enabled Identity Verification.
   */
  external_user_id_auth_hash?: string;
  /**
   * Recommended Number of seconds away from UTC.
   */
  timezone?: string;
  /**
   * Recommended Version of your app.
   */
  game_version?: string;
  /**
   * Recommended Device make and model. Example: iPhone5,1
   */
  device_model?: string;
  /**
   * Recommended Device operating system version. Example: 15.1.1
   */
  device_os?: string;
  /**
   * Number of times the user has played the game, defaults to 1.
   */
  session_count?: number;
  /**
   * Custom tags for the player. Only support string key value pairs. Does not support arrays or other nested objects. Example: {"foo":"bar","this":"that"}
   */
  tags?: Record<string, string>;
  /**
   * Amount the user has spent in USD, up to two decimal places.
   */
  amount_spent?: string;
  /**
   * Set Automatically based on the date the request was made. Unix timestamp in seconds indicating date and time when the device downloaded the app or subscribed to the website.
   */
  created_at?: number;
  /**
   * Seconds player was running your app.
   */
  playtime?: number;
  /**
   * Set Automatically based on the date the request was made. Unix timestamp in seconds indicating date and time when the device last used the app or website.
   */
  last_active?: number;
  /**
   * 1 = subscribed -2 = unsubscribed iOS - These values are set each time the user opens the app from the SDK. Use the SDK function set Subscription instead. Android - You may set this but you can no longer use the SDK method setSubscription later in your app as it will create synchronization issues.
   */
  notification_types?: number;
  /**
   * Latitude of the device, used for geotagging to segment on.
   */
  lat?: number;
  /**
   * Longitude of the device, used for geotagging to segment on.
   */
  long?: number;
  /**
   * Country code in the ISO 3166-1 Alpha 2 format. Example: US
   */
  country?: string;
  /**
   * The IANA timezone Identifier of the user. Example: Europe\/Warsaw
   */
  timezone_id?: string;
}

interface NotificationBase {
  /**
   * The OneSignal App Id.
   */
  app_id: string;
  /**
   * Correlation and idempotency key. A request received with this parameter will first look for another notification with the same external_id. If one exists, a notification will not be sent, and result of the previous operation will instead be returned. Therefore, if you plan on using this feature, it's important to use a good source of randomness to generate the UUID passed here. This key is only idempotent for 30 days. After 30 days, the notification could be removed from our system and a notification with the same external_id will be sent again. This is not the external_user_id.
   */
  external_id?: string;
  /**
   * An internal name to assist with your campaign organization. This does not get displayed on the message itself.
   */
  name?: string;
  /**
   * Schedule notification for future delivery. API defaults to UTC. Examples: All examples are the exact same date & time.<br>
   * "Thu Sep 24 2015 14:00:00 GMT-0700 (PDT)"<br>
   * "September 24th 2015, 2:00:00 pm UTC-07:00"<br>
   * "2015-09-24 14:00:00 GMT-0700"<br>
   * "Sept 24 2015 14:00:00 GMT-0700"
   */
  send_after?: string;
  /**
   * Possible values are: timezone (Deliver at a specific time-of-day in each users own timezone) last-active Same as Intelligent Delivery . (Deliver at the same time of day as each user last used your app). If send_after is used, this takes effect after the send_after time has elapsed. Cannot be used if Throttling enabled. Set throttle_rate_per_minute to 0 to disable throttling if enabled to use these features.
   */
  delayed_option?: string;
  /**
   * Use with delayed_option=timezone. Examples: "9:00AM" "21:45" "9:45:30"
   */
  delivery_time_of_day?: string;
  /**
   * Apps with throttling enabled - does not work with timezone or intelligent delivery, throttling limits will take precedence. Set to 0 if you want to use timezone or intelligent delivery. - the parameter value will be used to override the default application throttling value set from the dashboard settings. - parameter value 0 indicates not to apply throttling to the notification. - if the parameter is not passed then the default app throttling value will be applied to the notification. Apps with throttling disabled - this parameter cannot be used to throttle delivery for the notification.
   */
  throttle_rate_per_minute?: number;
}

interface SegmentNotification extends NotificationBase {
  /**
   * The segment names you want to target. Users in these segments will receive a notification. This targeting parameter is only compatible with excluded_segments.<br>
   * Example: ["Active Users", "Inactive Users"]
   */
  included_segments: string[];
  /**
   * Segment that will be excluded when sending. Users in these segments will not receive a notification, even if they were included in included_segments. This targeting parameter is only compatible with included_segments.<br>
   * Example: ["Active Users", "Inactive Users"]
   */
  excluded_segments?: string[];
}

/**
 * Limit of 2,000 entries per REST API call
 */
interface SpecificDevicesNotification extends NotificationBase {
  /**
   * Specific playerids to send your notification to. _Does not require API Auth Key.<br>
   * Example: ["1dd608f2-c6a1-11e3-851d-000c2940e62c"]
   */
  include_player_ids?: string[];
  /**
   * Target specific devices by custom user IDs assigned via API.<br>
   * Example: [“custom-id-assigned-by-api”]<br>
   * REQUIRED: REST API Key Authentication<br>
   * Note: If targeting push, email, or sms subscribers with same ids, use with channel_for_external_user_ids to indicate you are sending a push or email or sms.
   */
  include_external_user_ids?: string[];
  /**
   * Recommended for Sending Emails - Target specific email addresses.<br>
   * If an email does not correspond to an existing user, a new user will be created.<br>
   * Example: nick@catfac.ts
   */
  include_email_tokens?: string[];
  /**
   * Recommended for Sending SMS - Target specific phone numbers. The phone number should be in the E.164 format. Phone number should be an existing subscriber on OneSignal.<br>
   * Example phone number: +1999999999
   */
  include_phone_numbers?: string[];
  /**
   * Not Recommended: Please consider using include_player_ids or include_external_user_ids instead.<br>
   * Target using iOS device tokens.<br>
   * Warning: Only works with Production tokens.<br>
   * All non-alphanumeric characters must be removed from each token. If a token does not correspond to an existing user, a new user will be created.
   */
  include_ios_tokens?: string[];
  /**
   * Not Recommended: Please consider using include_player_ids or include_external_user_ids instead.<br>
   * Target using Windows URIs. If a token does not correspond to an existing user, a new user will be created.
   */
  include_wp_wns_uris?: string[];
  /**
   * Not Recommended: Please consider using include_player_ids or include_external_user_ids instead.<br>
   * Target using Amazon ADM registration IDs. If a token does not correspond to an existing user, a new user will be created.
   */
  include_amazon_reg_ids?: string[];
  /**
   * Not Recommended: Please consider using include_player_ids or include_external_user_ids instead.<br>
   * Target using Chrome App registration IDs. If a token does not correspond to an existing user, a new user will be created.
   */
  include_chrome_reg_ids?: string[];
  /**
   * Not Recommended: Please consider using include_player_ids or include_external_user_ids instead.<br>
   * Target using Chrome Web Push registration IDs. If a token does not correspond to an existing user, a new user will be created.
   */
  include_chrome_web_reg_ids?: string[];
  /**
   * Not Recommended: Please consider using include_player_ids or include_external_user_ids instead.<br>
   * Target using Android device registration IDs. If a token does not correspond to an existing user, a new user will be created.
   */
  include_android_reg_ids?: string[];
}

interface PushNotificationContent {
  /**
   * Required unless content_available=true or template_id is set.<br>
   * The notification's content (excluding the title), a map of language codes to text for each language.<br>
   * Each hash must have a language code string for a key, mapped to the localized text you would like users to receive for that language.<br>
   * Any language codes used must also be used within headings property.<br>
   * Example: {"en": "English Message", "es": "Spanish Message"}
   */
  contents?: Partial<Record<SupportedLanguages, string>>;
  /**
   * Required for Huawei<br>
   * Web Push requires a heading but can be omitted from request since defaults to the Site Name set in OneSignal Settings.<br>
   * The notification's title, a map of language codes to text for each language. Each hash you wish to include must have a language code string for a key mapped to the localized text you would like users to receive for that language.<br>
   * Example: {"en": "English Title", "es": "Spanish Title"}
   */
  headings?: Partial<Record<SupportedLanguages, string>>;
  /**
   * The notification's subtitle, a map of language codes to text for each language. Each hash must have a language code string for a key, mapped to the localized text you would like users to receive for that language.<br>
   * Example: {"en": "English Subtitle", "es": "Spanish Subtitle"}
   */
  subtitle?: Record<SupportedLanguages, string>;
  /**
   * Use a template you setup on our dashboard. The template_id is the UUID found in the URL when viewing a template on our dashboard.<br>
   * Example: "be4a8044-bbd6-11e4-a581-000c2940e62c"
   */
  template_id?: string;
  /**
   * Sending true wakes your app from background to run custom native code (Apple interprets this as content-available=1). Note: Not applicable if the app is in the "force-quit" state (i.e app was swiped away). Omit the contents field to prevent displaying a visible notification.
   */
  content_available?: boolean;
  /**
   * Always defaults to true and cannot be turned off. Allows tracking of notification receives and changing of the notification content in your app before it is displayed.
   */
  mutable_content?: boolean;
  /**
   * Use to target a specific experience in your App Clip, or to target your notification to a specific window in a multi-scene App.
   */
  target_content_identifier?: string;

  /**
   * Attachments
   */

  /**
   * A custom map of data that is passed back to your app. Same as using Additional Data within the dashboard. Can use up to 2048 bytes of data.<br>
   * Example: {"abc": 123, "foo": "bar", "event_performed": true, "amount": 12.1}
   */
  data?: Record<string, unknown>;
  /**
   * Use "data" or "message" depending on the type of notification you are sending.
   */
  huawei_msg_type?: string;
  /**
   * The URL to open in the browser when a user clicks on the notification.
   * Example: https://onesignal.com
   * Note: iOS needs https or updated
   */
  url?: string;
  /**
   * Same as url but only sent to web push platforms.
   * Including Chrome, Firefox, Safari, Opera, etc.
   */
  web_url?: string;
  /**
   * Same as url but only sent to app platforms.
   * Including iOS, Android, macOS, Windows, ChromeApps, etc.
   */
  app_url?: string;
  /**
   * Adds media attachments to notifications. Set as JSON object, key as a media id of your choice and the value as a valid local filename or URL. User must press and hold on the notification to view.
   * Do not set mutable_content to download attachments. The OneSignal SDK does this automatically.
   * Example: {"id1": "https://domain.com/image.jpg"}
   */
  ios_attachments?: Record<string, string>;
  /**
   * Picture to display in the expanded view. Can be a drawable resource name or a URL.
   */
  big_picture?: string;
  /**
   * Picture to display in the expanded view. Can be a drawable resource name or a URL.
   */
  huawei_big_picture?: string;
  /**
   * Sets the web push notification's large image to be shown below the notification's title and text
   * Works for Chrome for Windows & Android only. Chrome for macOS uses the same image set for the chrome_web_icon.
   */
  chrome_web_image?: string;
  /**
   * Picture to display in the expanded view. Can be a drawable resource name or a URL.
   */
  adm_big_picture?: string;
  /**
   * Large picture to display below the notification text. Must be a local URL.
   */
  chrome_big_picture?: string;

  /**
   * Action Buttons
   */

  /**
   * Buttons to add to the notification. Icon only works for Android.
   * Buttons show in order of array position.
   * Example: [{"id": "id1", "text": "first button", "icon": "ic_menu_share"}, {"id": "id2", "text": "second button", "icon": "ic_menu_send"}]
   */
  buttons?: ActionButton[];
  /**
   * Add action buttons to the notification. The id field is required.
   */
  web_buttons?: ActionButton[];
  /**
   * Category APS payload, use with registerUserNotificationSettings:categories in your Objective-C / Swift code.
   * Example: calendar category which contains actions like accept and decline
   */
  ios_category?: string;
  /**
   * In iOS you can specify the type of icon to be used in an Action button as being either ['system', 'custom']
   */
  icon_type?: string;

  /**
   * Appearance
   */

  /**
   * The Android Oreo Notification Category to send the notification under.
   */
  android_channel_id?: string;
  /**
   * The Android Oreo Notification Category to send the notification under.
   */
  huawei_channel_id?: string;
  /**
   * Use this if you have client side Android Oreo Channels you have already defined in your app with code.
   */
  existing_android_channel_id?: string;
  /**
   * Use this if you have client side Android Oreo Channels you have already defined in your app with code.
   */
  huawei_existing_channel_id?: string;
  /**
   * Icon shown in the status bar and on the top left of the notification. Set the icon name without the file extension.
   * If not set a bell icon will be used or ic_stat_onesignal_default if you have set this resource name.
   */
  small_icon?: string;
  /**
   * Icon shown in the status bar and on the top left of the notification.
   * Use an Android resource path (E.g. /drawable/small_icon).
   * Defaults to your app icon if not set.
   */
  huawei_small_icon?: string;
  /**
   * Can be a drawable resource name (exclude file extension) or a URL.
   */
  large_icon?: string;
  /**
   * Can be a drawable resource name or a URL.
   */
  huawei_large_icon?: string;
  /**
   * If not set a bell icon will be used or ic_stat_onesignal_default if you have set this resource name.
   */
  adm_small_icon?: string;
  /**
   * If blank the small_icon is used. Can be a drawable resource name or a URL.
   */
  adm_large_icon?: string;
  /**
   * Sets the web push notification's icon. An image URL linking to a valid image. Common image types are supported; GIF will not animate. We recommend 256x256 (at least 80x80) to display well on high DPI devices.
   */
  chrome_web_icon?: string;
  /**
   * Sets the web push notification icon for Android devices in the notification shade.
   */
  chrome_web_badge?: string;
  /**
   * Sets the web push notification's icon for Firefox. An image URL linking to a valid image. Common image types are supported; GIF will not animate. We recommend 256x256 (at least 80x80) to display well on high DPI devices.
   */
  firefox_icon?: string;
  /**
   * This flag is not used for web push For web push, please see chrome_web_icon instead.
   * The local URL to an icon to use. If blank, the app icon will be used.
   */
  chrome_icon?: string;
  /**
   * Sound file that is included in your app to play instead of the default device notification sound. Pass nil to disable vibration and sound for the notification.
   * Example: "notification.wav"
   */
  ios_sound?: string;
  /**
   * Sound file that is included in your app to play instead of the default device notification sound.
   * Example: "notification.wav"
   */
  wp_wns_sound?: string;
  /**
   * Sets the background color of the notification circle to the left of the notification text. Only applies to apps targeting Android API level 21+ on Android 5.0+ devices.
   * Example(Red): "FFFF0000"
   */
  android_accent_color?: string;
  /**
   * Accent Color used on Action Buttons and Group overflow count.
   * Uses RGB Hex value (E.g. #9900FF).
   * Defaults to device’s theme color if not set.
   */
  huawei_accent_color?: string;
  /**
   * Describes whether to set or increase/decrease your app's iOS badge count by the ios_badgeCount specified count. Can specify None, SetTo, or Increase.
   * None leaves the count unaffected.
   * SetTo directly sets the badge count to the number specified in ios_badgeCount.
   * Increase adds the number specified in ios_badgeCount to the total. Use a negative number to decrease the badge count.
   */
  ios_badgeType?: 'None' | 'SetTo' | 'Increase';
  /**
   * Used with ios_badgeType, describes the value to set or amount to increase/decrease your app's iOS badge count by.
   * You can use a negative number to decrease the badge count when used with an ios_badgeType of Increase.
   */
  ios_badgeCount?: number;
  /**
   * iOS can localize push notification messages on the client using special parameters such as loc-key. When using the Create Notification endpoint, you must include these parameters inside of a field called apns_alert.
   */
  apns_alert?: string;
}

type SegmentPushNotification = SegmentNotification & PushNotificationContent;
type SpecificDevicesPushNotification = SpecificDevicesNotification & PushNotificationContent;

export type CreateNotification = SegmentPushNotification | SpecificDevicesPushNotification;
export type CreateNotificationInput =
  | Omit<SegmentPushNotification, "app_id">
  | Omit<SpecificDevicesPushNotification, "app_id">;
