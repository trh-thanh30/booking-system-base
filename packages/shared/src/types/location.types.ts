export type LocationCoordinates = {
  latitude: number;
  longitude: number;
};

export type GlobalAddress = {
  countryCode: string;
  addressLine1: string;
  addressLine2?: string;
  locality: string;
  administrativeAreaLevel1?: string;
  administrativeAreaLevel2?: string;
  postalCode?: string;
  formattedAddress?: string;
  location: LocationCoordinates | null;
};

export type GeocodingAddress = Required<Omit<GlobalAddress, "location">>;

export type ForwardGeocodingInput = Required<
  Pick<
    GlobalAddress,
    | "countryCode"
    | "addressLine1"
    | "addressLine2"
    | "locality"
    | "administrativeAreaLevel1"
    | "administrativeAreaLevel2"
    | "postalCode"
  >
> & {
  locale: "vi" | "en";
};

export type ReverseGeocodingInput = LocationCoordinates & {
  locale: "vi" | "en";
};

export type GeocodingResult = {
  displayName: string;
  address: GeocodingAddress;
  location: LocationCoordinates;
};
