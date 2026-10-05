export interface IndustryHighlight {
  title: string;
  description: string;
}

export interface IndustryItem {
  id: string;
  label: string;
  badge: string;
  title: string;
  description: string;
  image: string;
  highlights: IndustryHighlight[];
  mockup: {
    businessName: string;
    businessType: string;
    avatarInitials: string;
    serviceName: string;
    servicePrice: string;
    duration: string;
    providerName: string;
    providerRole: string;
    specialDetailLabel: string;
    specialDetailValue: string;
    addonName: string;
    addonPrice: string;
    depositRequired: string;
  };
}
