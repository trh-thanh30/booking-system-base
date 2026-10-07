export interface AddressSearchResult {
  display_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface NominatimAddress {
  house_number?: string;
  house_name?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  path?: string;
  residential?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  hamlet?: string;
  village?: string;
  town?: string;
  city?: string;
  city_district?: string;
  district?: string;
  borough?: string;
  municipality?: string;
  county?: string;
  state?: string;
  state_district?: string;
  region?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

export interface NominatimSearchItem {
  display_name: string;
  lat?: string;
  lon?: string;
  class?: string;
  type?: string;
  address?: NominatimAddress;
}
