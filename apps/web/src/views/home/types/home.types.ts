import { ComponentType } from "react";

export interface TemplateService {
  name: string;
  price: string;
  duration: string;
}

export interface WebsiteTemplate {
  id: string;
  templateName: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  chips: string[];
  businessName: string;
  heroTagline: string;
  heroSubtitle: string;
  customerCta: string;
  avatar: string;
  category: string;
  services: TemplateService[];
  trustPoints: string[];
  review: string;
}

export interface CustomizationProps {
  customColor: string;
  setCustomColor: (color: string) => void;
  customRequireDeposit: boolean;
  setCustomRequireDeposit: (v: boolean) => void;
  customSMS: boolean;
  setCustomSMS: (v: boolean) => void;
  customStaff: boolean;
  setCustomStaff: (v: boolean) => void;
  customBusinessName: string;
  setCustomBusinessName: (name: string) => void;
  customSelectedStaff: string;
  setCustomSelectedStaff: (staff: string) => void;
}

export interface ToastMsg {
  id: string;
  businessName: string;
  timeStr: string;
}
