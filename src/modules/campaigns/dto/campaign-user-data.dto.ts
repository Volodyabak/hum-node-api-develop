export class CampaignUsersData {
  id: number;
  campaignUserId?: string | null;
  ip: string;
  userAgent: string;
  city: string;
  region?: string | null;
  country: string;
  latitude: number;
  longitude: number;

  userId: string;
  email: string;
  phoneNumber?: string | null;
  zipCode?: string | null;
  name: string;
  instagramUsername?: string | null;
}
