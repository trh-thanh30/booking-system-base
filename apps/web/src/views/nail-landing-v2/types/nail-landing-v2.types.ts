export interface HeaderV2Props {
  scrolled: boolean;
  onOpenMenu: () => void;
  activeSection: string;
}

export interface HeroV2Props {
  onBook: () => void;
}

export interface OffersV2Props {
  onBook: () => void;
}

export interface ServicesV2Props {
  onSelectService: (serviceId: string) => void;
}

export interface BookingV2Props {
  selectedService: string;
  setSelectedService: (serviceId: string) => void;
}

export interface ServiceItemV2 {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  image: string;
}

export interface GalleryItemV2 {
  id: number;
  url: string;
  title: string;
  category: string;
}
export interface ThemeColors {
  "brand-50": string;
  "brand-100": string;
  "brand-200": string;
  "brand-300": string;
  "brand-400": string;
  "brand-500": string;
  "brand-600": string;
  "brand-700": string;
  "brand-900": string;
}

export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
}
