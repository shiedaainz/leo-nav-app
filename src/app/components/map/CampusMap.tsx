"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LocateFixed } from "lucide-react";
import type { CampusLocation } from "@/data/campusLocations";
import type { CalculatedRoute } from "@/utils/dijkstra";
import type { Coordinates } from "@/utils/geo";
import type { DivIcon, Icon, LatLngExpression } from "leaflet";
import type {
  MapContainerProps,
  MarkerProps,
  PolylineProps,
  PopupProps,
  TileLayerProps,
} from "react-leaflet";

interface CampusMapProps {
  activeRoute: CalculatedRoute | null;
  geolocationError: string | null;
  isLocating: boolean;
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  userLocation: Coordinates | null;
  onStartTracking: () => void;
}

const MapContainer = dynamic<MapContainerProps>(
  () => import("react-leaflet").then((module) => module.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[var(--up-blue)] text-sm text-[var(--up-gray)]/80">
        Cargando mapa...
      </div>
    ),
  },
);

const TileLayer = dynamic<TileLayerProps>(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false },
);

const Marker = dynamic<MarkerProps>(
  () => import("react-leaflet").then((module) => module.Marker),
  { ssr: false },
);

const Popup = dynamic<PopupProps>(
  () => import("react-leaflet").then((module) => module.Popup),
  { ssr: false },
);

const Polyline = dynamic<PolylineProps>(
  () => import("react-leaflet").then((module) => module.Polyline),
  { ssr: false },
);

const RecenterMap = dynamic(() => import("./RecenterMap"), {
  ssr: false,
});

const GraphEditor = dynamic(() => import("./GraphEditor"), {
  ssr: false,
});

const campusCenter: LatLngExpression = [7.383545, -72.648346];

export default function CampusMap({
  activeRoute,
  geolocationError,
  isLocating,
  locations,
  selectedLocation,
  userLocation,
  onStartTracking,
}: CampusMapProps) {
  const [markerIcon, setMarkerIcon] = useState<Icon>();
  const [destinationIcon, setDestinationIcon] = useState<DivIcon>();
  const [isGraphEditorEnabled] = useState(
    () =>
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("editor") === "true",
  );

  useEffect(() => {
    let isMounted = true;

    import("leaflet").then((leaflet) => {
      if (!isMounted) {
        return;
      }

      setMarkerIcon(
        new leaflet.Icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      );

      setDestinationIcon(
        leaflet.divIcon({
          className: "leo-destination-marker",
          html: '<span class="leo-destination-dot"></span>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      );
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedPosition: LatLngExpression | null = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : null;
  const routeEnd = activeRoute?.coordinates.at(-1);

  return (
    <section className="relative mt-4 px-4 pb-[40vh] sm:mt-6 sm:px-6 sm:pb-[46vh]">
      <div className="relative h-[58vh] min-h-[390px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/25 sm:h-[560px]">
        <MapContainer
          center={campusCenter}
          zoom={16}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {activeRoute && (
            <>
              <Polyline
                positions={activeRoute.coordinates}
                pathOptions={{ color: "#ef4444", weight: 7, opacity: 0.9 }}
              />
              <Polyline
                positions={activeRoute.coordinates}
                pathOptions={{ color: "#ffffff", weight: 3, opacity: 0.9 }}
              />
              {routeEnd && (
                <RecenterMap lat={routeEnd[0]} lng={routeEnd[1]} zoom={17} />
              )}
            </>
          )}

          {!activeRoute && selectedPosition && (
            <RecenterMap
              lat={selectedLocation!.lat}
              lng={selectedLocation!.lng}
              zoom={17}
            />
          )}

          {markerIcon &&
            locations.map((place) => {
              const isSelected = place.id === selectedLocation?.id;
              const icon = isSelected && destinationIcon ? destinationIcon : markerIcon;

              return (
                <Marker
                  key={place.id}
                  position={[place.lat, place.lng]}
                  icon={icon}
                >
                  <Popup>
                    <strong>{place.name}</strong>
                    <br />
                    {place.description}
                  </Popup>
                </Marker>
              );
            })}

          {markerIcon && userLocation && (
            <>
              {!selectedLocation && !activeRoute && (
                <RecenterMap
                  lat={userLocation.lat}
                  lng={userLocation.lng}
                  zoom={17}
                />
              )}
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={markerIcon}
              >
                <Popup>Estas aqui</Popup>
              </Marker>
            </>
          )}
          {isGraphEditorEnabled && <GraphEditor />}
        </MapContainer>

        <div className="absolute right-3 top-1/2 z-[1000] flex max-w-[calc(100%-1.5rem)] -translate-y-1/2 flex-col items-end gap-2 sm:right-4">
          <button
            type="button"
            onClick={onStartTracking}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white text-[var(--up-blue-dark)] shadow-xl transition hover:scale-105 hover:bg-[var(--up-gray)] disabled:cursor-wait disabled:opacity-80"
            disabled={isLocating}
            aria-label="Ubicarme en el mapa"
          >
            <LocateFixed size={22} className={isLocating ? "animate-pulse" : ""} />
          </button>

          {isLocating && (
            <p className="rounded-xl bg-[var(--up-blue-dark)]/90 px-3 py-2 text-xs text-white shadow-lg">
              Buscando posicion...
            </p>
          )}

          {activeRoute && (
            <p className="rounded-xl bg-[var(--up-blue-dark)]/90 px-3 py-2 text-xs text-white shadow-lg">
              Ruta: {activeRoute.distance} m / {activeRoute.estimatedMinutes} min
            </p>
          )}

          {geolocationError && (
            <p className="rounded-xl bg-[var(--up-blue-dark)]/90 px-3 py-2 text-xs text-red-100 shadow-lg">
              {geolocationError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}




