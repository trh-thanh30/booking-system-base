export interface IndustryHighlight {
  titleKey: string;
  descriptionKey: string;
}

export interface IndustryItem {
  id: string;
  labelKey: string;
  badgeKey: string;
  titleKey: string;
  descriptionKey: string;
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
