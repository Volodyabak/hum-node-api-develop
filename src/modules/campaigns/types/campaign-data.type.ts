export type CampaignData = {
  campaignType: string;
  ageModal: {
    display: boolean;
    backgroundColor: string;
  };
  topSection: {
    header: {
      backgroundColor: string;
      opacity: number;
    };
    title: {
      desktop: {
        stringize: number;
        fontFamily: string;
        color: string;
        align: string;
        value: string;
      };
      mobile: {
        stringize: number;
        fontFamily: string;
        color: string;
        align: string;
        value: string;
      };
    };
    subtitle: {
      desktop: {
        stringize: number;
        fontFamily: string;
        color: string;
        align: string;
        value: string;
      };
      mobile: {
        stringize: number;
        fontFamily: string;
        color: string;
        align: string;
        value: string;
      };
    };
    backgroundImage: {
      desktop: string;
      mobile: string;
      overlay: {
        backgroundColor: string;
        opacity: number;
      };
    };
    logo: {
      primary: string;
      secondary: string;
    };
    scrollButton: {
      color: string;
      fillBackground: boolean;
      backgroundColor: string;
      align: string;
    };
  };
  middleSection: CampaignBrackhitData | CampaignBallotData;
  bottomSection: {
    products: {
      fontFamily: string;
      items: {
        id: string;
        title?: string;
        description?: string;
        url?: string;
        image?: string;
      }[];
    };
  };
};

export type CampaignBrackhitData = {
  brackhitType: string;
  modal: {
    desktop: {
      fontSize: number;
      fontFamily: string;
      title: string;
      description: string;
    };
    mobile: {
      fontSize: number;
      fontFamily: string;
      title: string;
      description: string;
    };
  };
  brackhit: {
    brackhitId: number;
    name: string;
    type: string;
  };
  brackhitUser: {
    userId: string;
    username: string;
  };
  trackPreview: boolean;
  collectInstagramUsername: boolean;
  collectPhoneNumber: boolean;
  tryAgain: {
    display: boolean;
    backgroundColor: string;
  };
  cta: {
    display: boolean;
    backgroundColor: string;
    value: string;
    url: string;
  };
};

export type CampaignBallotData = {};
