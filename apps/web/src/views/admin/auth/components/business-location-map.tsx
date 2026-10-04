"use client";

import { useEffect, useRef, useState } from "react";
import type { Map, Marker } from "leaflet";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { AuthInput as Input } from "@/src/components/common";
import { LocateFixed } from "lucide-react";
import { mapConfig } from "@/src/config/map.config";

type Location = { latitude: number; longitude: number } | null;

export function BusinessLocationMap({
  value,
  onChange,
  disabled,
}: {
  value: Location;
  onChange: (location: Location) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("AuthJourney");
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const marker = useRef<Marker | null>(null);
  const change = useRef(onChange);
  change.current = onChange;
  const currentValue = useRef(value);
  currentValue.current = value;
  const isDisabled = useRef(disabled);
  isDisabled.current = disabled;
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
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
            if (!cancelled) setError("mapUnavailable");
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
          change.current({
            latitude: Math.max(-90, Math.min(90, point.lat)),
            longitude: ((((point.lng + 180) % 360) + 360) % 360) - 180,
          });
        });
        instance.on("click", (event) => {
          if (!isDisabled.current)
            change.current({
              latitude: Math.max(-90, Math.min(90, event.latlng.lat)),
              longitude: ((((event.latlng.lng + 180) % 360) + 360) % 360) - 180,
            });
        });
      })
      .catch(() => {
        if (!cancelled) setError("mapUnavailable");
      });
    return () => {
      cancelled = true;
      mounted.current = false;
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
    } else if (pin && instance) instance.removeLayer(pin);
    if (disabled) pin?.dragging?.disable();
    else pin?.dragging?.enable();
  }, [value, disabled]);
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
        change.current({
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
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t("mapHint")}</p>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 rounded-full"
        disabled={disabled || locating}
        onClick={locate}
      >
        <LocateFixed className="size-4" />
        {t(locating ? "locating" : "locateMe")}
      </Button>
      <div
        ref={container}
        role="region"
        aria-label={t("mapLabel")}
        className="relative z-0 h-64 overflow-hidden rounded-md border bg-muted"
      />
      {error ? (
        <p role="status" className="text-sm text-destructive">
          {t(error)}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
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
      </div>
      {value ? (
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          onClick={() => onChange(null)}
        >
          {t("clearLocation")}
        </Button>
      ) : null}
    </div>
  );
}
