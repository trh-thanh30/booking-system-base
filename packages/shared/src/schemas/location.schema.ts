import { z } from "zod";
import type {
  ForwardGeocodingInput,
  GeocodingAddress,
  GeocodingResult,
  GlobalAddress,
  LocationCoordinates,
  ReverseGeocodingInput,
} from "../types/location.types.ts";

export const locationCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
}) satisfies z.ZodType<LocationCoordinates>;

export const geocodingAddressSchema = z.object({
  countryCode: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string(),
  locality: z.string(),
  administrativeAreaLevel1: z.string(),
  administrativeAreaLevel2: z.string(),
  postalCode: z.string(),
  formattedAddress: z.string(),
}) satisfies z.ZodType<GeocodingAddress>;

export const globalAddressSchema = geocodingAddressSchema.extend({
  countryCode: z.string().trim().length(2).toUpperCase(),
  addressLine1: z.string().trim().min(1).max(255),
  addressLine2: z.string().trim().max(255).optional(),
  locality: z.string().trim().min(1).max(100),
  administrativeAreaLevel1: z.string().trim().max(100).optional(),
  administrativeAreaLevel2: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  formattedAddress: z.string().trim().max(500).optional(),
  location: locationCoordinatesSchema.nullable(),
}) satisfies z.ZodType<GlobalAddress>;

export const forwardGeocodingInputSchema = geocodingAddressSchema
  .omit({ formattedAddress: true })
  .extend({
    countryCode: z.string().trim().length(2).toLowerCase(),
    addressLine1: z.string().trim().min(1).max(255),
    addressLine2: z.string().trim().max(255),
    locality: z.string().trim().min(1).max(100),
    administrativeAreaLevel1: z.string().trim().max(100),
    administrativeAreaLevel2: z.string().trim().max(100),
    postalCode: z.string().trim().max(20),
    locale: z.enum(["vi", "en"]),
  }) satisfies z.ZodType<ForwardGeocodingInput>;

export const reverseGeocodingInputSchema = locationCoordinatesSchema.extend({
  locale: z.enum(["vi", "en"]),
}) satisfies z.ZodType<ReverseGeocodingInput>;

export const geocodingResultSchema = z.object({
  displayName: z.string(),
  address: geocodingAddressSchema,
  location: locationCoordinatesSchema,
}) satisfies z.ZodType<GeocodingResult>;
