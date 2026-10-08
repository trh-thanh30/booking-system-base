"use client";

import { mapConfig } from "@/src/config/map.config";
import type { LocationCoordinates } from "@repo/shared";
import { cn, Skeleton } from "@repo/ui";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Map, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { getCountryMapView } from "./utils/location-picker.utils";
import { MapAttribution } from "./map-attribution";

export type LocationPickerMapProps = {
  value: LocationCoordinates | null;
  countryCode?: string;
  onChange: (location: LocationCoordinates) => void;
  onUnavailable?: () => void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
};

function normalizeCoordinates(latitude: number, longitude: number) {
  return {
    latitude: Math.max(-90, Math.min(90, latitude)),
    longitude: ((((longitude + 180) % 360) + 360) % 360) - 180,
  };
}

export function LocationPickerMap({
  value,
  countryCode = "VN",
  onChange,
  onUnavailable,
  disabled,
  ariaLabel,
  className,
}: LocationPickerMapProps) {
  const t = useTranslations("Map");
  const container = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [tilesLoading, setTilesLoading] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [attributionOpen, setAttributionOpen] = useState(true);
  useEffect(() => {
    if (!mapReady || !container.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setMapVisible(true);
      observer.disconnect();
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [mapReady]);
  useEffect(() => {
    if (!mapVisible) return;
    const timeout = window.setTimeout(() => setAttributionOpen(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [mapVisible]);
  const map = useRef<Map | null>(null);
  const marker = useRef<Marker | null>(null);
  const change = useRef(onChange);
  change.current = onChange;
  const unavailable = useRef(onUnavailable);
  unavailable.current = onUnavailable;
  const currentValue = useRef(value);
  currentValue.current = value;
  const currentCountry = useRef(countryCode);
  currentCountry.current = countryCode;
  const isDisabled = useRef(disabled);
  isDisabled.current = disabled;

  useEffect(() => {
    let cancelled = false;
    void import("leaflet")
      .then((L) => {
        if (cancelled || !container.current) return;
        const countryView = getCountryMapView(currentCountry.current);
        const center = currentValue.current ?? countryView;
        const instance = L.map(container.current, {
          attributionControl: false,
        }).setView(
          [center.latitude, center.longitude],
          currentValue.current ? 13 : countryView.zoom,
        );
        map.current = instance;
        setMapReady(true);
        instance.on("movestart zoomstart click", () =>
          setAttributionOpen(false),
        );
        L.tileLayer(mapConfig.tileUrl, {
          maxZoom: 19,
        })
          .on("loading", () => {
            if (!cancelled) setTilesLoading(true);
          })
          .on("load", () => {
            if (!cancelled) setTilesLoading(false);
          })
          .on("tileerror", () => {
            if (!cancelled) {
              setTilesLoading(false);
              unavailable.current?.();
            }
          })
          .addTo(instance);
        const pin = L.marker([center.latitude, center.longitude], {
          draggable: true,
          icon: L.divIcon({
            className: "business-map-pin",
            html: '<span aria-hidden="true"></span>',
            iconSize: [28, 36],
            iconAnchor: [14, 36],
          }),
        });
        marker.current = pin;
        if (currentValue.current) pin.addTo(instance);
        pin.on("dragend", () => {
          if (isDisabled.current) return;
          const point = pin.getLatLng();
          change.current(normalizeCoordinates(point.lat, point.lng));
        });
        instance.on("click", (event) => {
          if (!isDisabled.current) {
            change.current(
              normalizeCoordinates(event.latlng.lat, event.latlng.lng),
            );
          }
        });
      })
      .catch(() => {
        if (!cancelled) {
          setMapFailed(true);
          unavailable.current?.();
        }
      });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  useEffect(() => {
    const pin = marker.current;
    const instance = map.current;
    if (value && pin && instance) {
      pin.setLatLng([value.latitude, value.longitude]).addTo(instance);
      instance.setView(
        [value.latitude, value.longitude],
        Math.max(instance.getZoom(), 13),
      );
    } else if (pin && instance) {
      instance.removeLayer(pin);
      const view = getCountryMapView(countryCode);
      instance.setView([view.latitude, view.longitude], view.zoom);
    }
    if (disabled) pin?.dragging?.disable();
    else pin?.dragging?.enable();
  }, [value, disabled, countryCode]);

  return (
    <div className="relative z-0">
      <div
        ref={container}
        role="region"
        aria-label={ariaLabel}
        aria-busy={!mapFailed && (!mapReady || tilesLoading)}
        className={cn(
          "relative z-0 h-64 overflow-hidden rounded-md border bg-muted",
          className,
        )}
      />
      {!mapReady ? (
        <div
          role="status"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-md"
        >
          {!mapFailed ? (
            <>
              <Skeleton
                aria-hidden="true"
                className="absolute inset-0 h-full w-full motion-reduce:animate-none"
              />
              <span className="sr-only">{t("loading")}</span>
            </>
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">
              {t("unavailable")}
            </p>
          )}
        </div>
      ) : null}
      {mapReady && tilesLoading ? (
        <div
          role="status"
          className="pointer-events-none absolute left-2 top-2 z-[400] flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
          {t("loadingTiles")}
        </div>
      ) : null}
      {mapReady && mapVisible ? (
        <MapAttribution
          open={attributionOpen}
          onOpenChange={setAttributionOpen}
        />
      ) : null}
    </div>
  );
}
