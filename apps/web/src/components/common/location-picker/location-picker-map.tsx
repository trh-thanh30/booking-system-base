"use client";

import { mapConfig } from "@/src/config/map.config";
import type { LocationCoordinates } from "@repo/shared";
import { cn } from "@repo/ui";
import type { Map, Marker } from "leaflet";
import { useEffect, useRef } from "react";

export type LocationPickerMapProps = {
  value: LocationCoordinates | null;
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
  onChange,
  onUnavailable,
  disabled,
  ariaLabel,
  className,
}: LocationPickerMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const marker = useRef<Marker | null>(null);
  const change = useRef(onChange);
  change.current = onChange;
  const unavailable = useRef(onUnavailable);
  unavailable.current = onUnavailable;
  const currentValue = useRef(value);
  currentValue.current = value;
  const isDisabled = useRef(disabled);
  isDisabled.current = disabled;

  useEffect(() => {
    let cancelled = false;
    void import("leaflet")
      .then((L) => {
        if (cancelled || !container.current) return;
        const center = currentValue.current ?? mapConfig.initialCenter;
        const instance = L.map(container.current).setView(
          [center.latitude, center.longitude],
          13,
        );
        map.current = instance;
        L.tileLayer(mapConfig.tileUrl, {
          attribution: mapConfig.attribution,
          maxZoom: 19,
        })
          .on("tileerror", () => {
            if (!cancelled) unavailable.current?.();
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
        if (!cancelled) unavailable.current?.();
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
      instance.panTo([value.latitude, value.longitude]);
    } else if (pin && instance) {
      instance.removeLayer(pin);
    }
    if (disabled) pin?.dragging?.disable();
    else pin?.dragging?.enable();
  }, [value, disabled]);

  return (
    <div
      ref={container}
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "relative z-0 h-64 overflow-hidden rounded-md border bg-muted",
        className,
      )}
    />
  );
}
