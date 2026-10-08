"use client";

import { AuthInput as Input, LocationPickerMap } from "@/src/components/common";
import { geocodingService } from "@/src/services/admin/geocoding.service";
import { useToast } from "@repo/hooks";
import type {
  ForwardGeocodingInput,
  GeocodingAddress,
  LocationCoordinates,
} from "@repo/shared";
import { Button } from "@repo/ui";
import { LoaderCircle, LocateFixed, MapPin, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export function BusinessLocationMap({
  value,
  address,
  onChange,
  onAddressChange,
  onFormattedAddressChange,
  disabled,
}: {
  value: LocationCoordinates | null;
  address: Omit<ForwardGeocodingInput, "locale">;
  onChange: (location: LocationCoordinates | null) => void;
  onAddressChange: (address: GeocodingAddress) => void;
  onFormattedAddressChange: (address: string) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("AuthJourney");
  const locale = useLocale() === "en" ? "en" : "vi";
  const { toast } = useToast();
  const change = useRef(onChange);
  change.current = onChange;
  const changeAddress = useRef(onAddressChange);
  changeAddress.current = onAddressChange;
  const [error, setError] = useState("");
  const [coordinateErrors, setCoordinateErrors] = useState({
    latitude: false,
    longitude: false,
  });
  useEffect(() => {
    setCoordinateErrors((current) => ({
      latitude:
        current.latitude &&
        value !== null &&
        (!Number.isFinite(value.latitude) || Math.abs(value.latitude) > 90),
      longitude:
        current.longitude &&
        value !== null &&
        (!Number.isFinite(value.longitude) || Math.abs(value.longitude) > 180),
    }));
  }, [value]);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState<"forward" | "reverse" | null>(
    null,
  );
  const geocodingRequest = useRef(0);
  const currentCountry = useRef(address.countryCode);
  currentCountry.current = address.countryCode;
  useEffect(() => {
    // Discard lookups for the previous country so they cannot restore an old pin.
    geocodingRequest.current += 1;
    setGeocoding(null);
    setLocating(false);
  }, [address.countryCode]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function fillAddress(location: LocationCoordinates) {
    const request = ++geocodingRequest.current;
    setGeocoding("reverse");
    try {
      const result = await geocodingService.reverse({ ...location, locale });
      if (request !== geocodingRequest.current || !mounted.current) return;
      if (!result) {
        toast.error(t("addressNotFound"));
        return;
      }
      changeAddress.current(result.address);
    } catch {
      if (request === geocodingRequest.current && mounted.current) {
        toast.error(t("geocodingFailed"));
      }
    } finally {
      if (request === geocodingRequest.current && mounted.current) {
        setGeocoding(null);
      }
    }
  }

  function selectLocation(location: LocationCoordinates) {
    change.current(location);
    void fillAddress(location);
  }

  async function findOnMap() {
    if (disabled || geocoding) return;
    const request = ++geocodingRequest.current;
    setGeocoding("forward");
    try {
      const result = await geocodingService.forward({ ...address, locale });
      if (request !== geocodingRequest.current || !mounted.current) return;
      if (!result) {
        toast.error(t("addressNotFound"));
        return;
      }
      change.current(result.location);
      onFormattedAddressChange(result.displayName);
    } catch {
      if (request === geocodingRequest.current && mounted.current) {
        toast.error(t("geocodingFailed"));
      }
    } finally {
      if (request === geocodingRequest.current && mounted.current) {
        setGeocoding(null);
      }
    }
  }

  function locate() {
    if (disabled || locating) return;
    if (!navigator.geolocation) {
      setError("locationDenied");
      return;
    }
    setLocating(true);
    const locationRequest = geocodingRequest.current;
    const requestedCountry = address.countryCode;
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (
          !mounted.current ||
          currentCountry.current !== requestedCountry ||
          geocodingRequest.current !== locationRequest
        )
          return;
        setLocating(false);
        selectLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        if (
          mounted.current &&
          currentCountry.current === requestedCountry &&
          geocodingRequest.current === locationRequest
        ) {
          setLocating(false);
          setError("locationDenied");
        }
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }
  const canFindOnMap = Boolean(
    address.countryCode.trim() &&
    address.locality.trim() &&
    address.addressLine1.trim(),
  );
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t("mapHint")}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 rounded-full"
          disabled={disabled || !canFindOnMap || Boolean(geocoding)}
          onClick={() => void findOnMap()}
        >
          {geocoding === "forward" ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <MapPin aria-hidden="true" className="size-4" />
          )}
          {t(geocoding === "forward" ? "findingOnMap" : "findOnMap")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 rounded-full"
          disabled={disabled || locating || Boolean(geocoding)}
          onClick={locate}
        >
          {locating ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <LocateFixed aria-hidden="true" className="size-4" />
          )}
          {t(locating ? "locating" : "locateMe")}
        </Button>
      </div>
      <div className="relative">
        <LocationPickerMap
          countryCode={address.countryCode}
          value={value}
          disabled={disabled}
          ariaLabel={t("mapLabel")}
          onChange={selectLocation}
          onUnavailable={() => setError("mapUnavailable")}
        />
        {geocoding === "reverse" ? (
          <div
            role="status"
            className="absolute left-3 top-3 z-[400] flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-sm shadow-sm"
          >
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            {t("findingAddress")}
          </div>
        ) : null}
      </div>
      {error ? (
        <p role="status" className="text-sm text-destructive">
          {t(error)}
        </p>
      ) : null}
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
        {(["latitude", "longitude"] as const).map((coordinate) => (
          <div key={coordinate} className="min-w-0 space-y-2 text-sm">
            <label htmlFor={`location-${coordinate}`}>{t(coordinate)}</label>
            <Input
              id={`location-${coordinate}`}
              type="number"
              placeholder={t(`placeholders.${coordinate}`)}
              step="any"
              min={coordinate === "latitude" ? -90 : -180}
              max={coordinate === "latitude" ? 90 : 180}
              disabled={disabled}
              aria-invalid={coordinateErrors[coordinate]}
              aria-describedby={
                coordinateErrors[coordinate]
                  ? `location-${coordinate}-error`
                  : undefined
              }
              className={
                coordinateErrors[coordinate] ? "border-destructive" : undefined
              }
              value={value?.[coordinate] ?? ""}
              onBlur={(event) => {
                const invalid = !event.currentTarget.validity.valid;
                setCoordinateErrors((current) => ({
                  ...current,
                  [coordinate]: invalid,
                }));
              }}
              onChange={(event) => {
                const number = Number(event.target.value);
                if (event.target.value === "") {
                  onChange(null);
                  return;
                }
                if (Number.isFinite(number))
                  onChange({
                    latitude: value?.latitude ?? 0,
                    longitude: value?.longitude ?? 0,
                    [coordinate]: number,
                  });
              }}
            />
            {coordinateErrors[coordinate] ? (
              <p
                id={`location-${coordinate}-error`}
                role="alert"
                className="text-sm text-destructive"
              >
                {t(
                  coordinate === "latitude"
                    ? "invalidLatitude"
                    : "invalidLongitude",
                )}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {value ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full gap-2 text-body sm:w-auto"
            disabled={disabled}
            onClick={() => {
              geocodingRequest.current += 1;
              setGeocoding(null);
              setLocating(false);
              setCoordinateErrors({ latitude: false, longitude: false });
              onChange(null);
              requestAnimationFrame(() =>
                document.getElementById("location-latitude")?.focus(),
              );
            }}
          >
            <X aria-hidden="true" className="size-4" />
            {t("clearLocation")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
