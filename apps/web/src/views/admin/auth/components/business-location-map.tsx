"use client";

import { AuthInput as Input, LocationPickerMap } from "@/src/components/common";
import { geocodingService } from "@/src/services/admin/geocoding.service";
import { useToast } from "@repo/hooks";
import type {
  ForwardGeocodingInput,
  GeocodingAddress,
  LocationCoordinates,
} from "@repo/shared";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
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
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState<"forward" | "reverse" | null>(
    null,
  );
  const geocodingRequest = useRef(0);
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
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mounted.current) return;
        setLocating(false);
        selectLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        if (mounted.current) {
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
      <div
        className={
          value
            ? "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem] items-end gap-3"
            : "grid grid-cols-2 gap-3"
        }
      >
        {(["latitude", "longitude"] as const).map((coordinate) => (
          <label key={coordinate} className="space-y-2 text-sm">
            {t(coordinate)}
            <Input
              type="number"
              placeholder={t(`placeholders.${coordinate}`)}
              step="any"
              min={coordinate === "latitude" ? -90 : -180}
              max={coordinate === "latitude" ? 90 : 180}
              disabled={disabled}
              value={value?.[coordinate] ?? ""}
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
          </label>
        ))}
        {value ? (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  disabled={disabled}
                  aria-label={t("clearLocation")}
                  onClick={() => onChange(null)}
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("clearLocation")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
    </div>
  );
}
