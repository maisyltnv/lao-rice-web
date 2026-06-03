"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Vientiane Capital center */
export const VIENTIANE_CENTER = { lat: 17.9757, lng: 102.6331 };

const MIN_LAT = 17.85;
const MAX_LAT = 18.25;
const MIN_LNG = 102.45;
const MAX_LNG = 102.85;

export function isInsideVientiane(lat: number, lng: number): boolean {
  return lat >= MIN_LAT && lat <= MAX_LAT && lng >= MIN_LNG && lng <= MAX_LNG;
}

const DeliveryLocationMap = dynamic(
  () =>
    import("./delivery-location-map").then((m) => m.DeliveryLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 w-full items-center justify-center rounded-lg border border-border bg-muted/50 text-sm text-muted-foreground">
        ກຳລັງໂຫຼດແຜນທີ່...
      </div>
    ),
  }
);

type Props = {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
};

export function DeliveryLocationPicker({ latitude, longitude, onChange }: Props) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lat = latitude ?? VIENTIANE_CENTER.lat;
  const lng = longitude ?? VIENTIANE_CENTER.lng;

  const setCoords = useCallback(
    (newLat: number, newLng: number) => {
      if (!isInsideVientiane(newLat, newLng)) {
        setError("ກະລຸນາເລືອກຈຸດພາຍໃນນະຄອນຫຼວງວຽງຈັນເທົ່ານັ້ນ");
        return;
      }
      setError(null);
      onChange(newLat, newLng);
    },
    [onChange]
  );

  useEffect(() => {
    if (latitude == null && longitude == null) {
      onChange(VIENTIANE_CENTER.lat, VIENTIANE_CENTER.lng);
    }
  }, [latitude, longitude, onChange]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("ອຸປະກອນບໍ່ຮອງຮັບ GPS");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocating(false);
        setError("ບໍ່ສາມາດອ່ານຕຳແໜ່ງໄດ້ — ກະລຸນາອະນຸຍາດ GPS");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-start gap-2">
        <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">ຈຸດສົ່ງເຂົ້າ (ພາຍໃນນະຄອນຫຼວງວຽງຈັນ)</p>
          <p className="text-xs text-muted-foreground mt-1">
            ກົດໃນແຜນທີ່ ຫຼື ລາກຫມຸດເພື່ອປັກຈຸດ — ຫຼື ໃຊ້ GPS
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={useMyLocation}
          disabled={locating}
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Navigation className="h-4 w-4 mr-2" />
          )}
          ໃຊ້ຕຳແໜ່ງຂອງຂ້ອຍ
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border [&_.leaflet-container]:z-0">
        <DeliveryLocationMap
          latitude={lat}
          longitude={lng}
          onPick={setCoords}
        />
      </div>

      <p className="text-xs font-mono text-muted-foreground">
        ພິກັດ: {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {latitude != null &&
        longitude != null &&
        !isInsideVientiane(latitude, longitude) && (
          <p className="text-sm text-destructive">
            ຈຸດນີ້ຢູ່ນອກເຂດຈັດສົ່ງ (ນະຄອນຫຼວງວຽງຈັນ)
          </p>
        )}
    </div>
  );
}
