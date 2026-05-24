"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/ui/Header";
import SearchBar from "../components/ui/SearchBar";
import CampusMap from "../components/map/CampusMap";
import NavigationPanel from "../components/navigation/NavigationPanel";
import LeoAvatar from "../components/leo/LeoAvatar";
import CameraGuide from "../components/navigation/CameraGuide";
import { campusLocations, type CampusLocation } from "@/data/campusLocations";
import {
  campusEdges,
  campusNodes,
  defaultStartNodeId,
  locationNodeById,
} from "@/data/campusGraph";
import useGeolocation from "@/hooks/useGeolocation";
import {
  calculateShortestRoute,
  type CalculatedRoute,
} from "@/utils/dijkstra";
import { calculateDistanceInMeters, findNearestNode } from "@/utils/geo";
import { logout, type SessionUser } from "@/utils/auth";

export default function HomePage() {
  const router = useRouter();
  const sessionSnapshot = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const destinationSnapshot = useSyncExternalStore(
    subscribeToDestination,
    getDestinationSnapshot,
    getServerDestinationSnapshot,
  );
  const sessionUser = useMemo(() => parseSession(sessionSnapshot), [sessionSnapshot]);
  const [query, setQuery] = useState("");
  const [manualLocationId, setManualLocationId] = useState<string | null>(null);
  const [activeRoute, setActiveRoute] = useState<CalculatedRoute | null>(null);
  const [isCameraGuideOpen, setIsCameraGuideOpen] = useState(false);
  const { error, isLocating, location, startTracking } = useGeolocation();

  useEffect(() => {
    if (sessionSnapshot === null) {
      router.replace("/login");
    }
  }, [router, sessionSnapshot]);

  const selectedLocation = useMemo(() => {
    const selectedId = manualLocationId ?? destinationSnapshot ?? campusLocations[0]?.id;

    return (
      campusLocations.find((campusLocation) => campusLocation.id === selectedId) ??
      campusLocations[0] ??
      null
    );
  }, [destinationSnapshot, manualLocationId]);

  const nearestStartNode = useMemo(() => {
    if (!location) {
      return null;
    }

    return findNearestNode(location, campusNodes);
  }, [location]);

  const routePreview = useMemo(() => {
    if (!selectedLocation) {
      return null;
    }

    const destinationNodeId = locationNodeById[selectedLocation.id];

    if (!destinationNodeId) {
      return null;
    }

    return calculateShortestRoute({
      nodes: campusNodes,
      edges: campusEdges,
      startNodeId: nearestStartNode?.node.id ?? defaultStartNodeId,
      endNodeId: destinationNodeId,
    });
  }, [nearestStartNode, selectedLocation]);

  const distanceToDestination = useMemo(() => {
    if (!location || !selectedLocation) {
      return null;
    }

    return calculateDistanceInMeters(location, {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    });
  }, [location, selectedLocation]);

  const leoMessage = useMemo(
    () =>
      getLeoMessage({
        activeRoute,
        destinationName: selectedLocation?.name,
        distanceToDestination,
        geolocationError: error,
        hasLocation: Boolean(location),
        isLocating,
        routePreview,
      }),
    [
      activeRoute,
      distanceToDestination,
      error,
      isLocating,
      location,
      routePreview,
      selectedLocation,
    ],
  );

  const handleSelectLocation = (locationToSelect: CampusLocation) => {
    setManualLocationId(locationToSelect.id);
    setActiveRoute(null);
    setIsCameraGuideOpen(false);
    setQuery("");
  };

  const handleStartNavigation = () => {
    if (!selectedLocation) {
      return;
    }

    const destinationNodeId = locationNodeById[selectedLocation.id];

    if (!destinationNodeId) {
      setActiveRoute(null);
      return;
    }

    const startNodeId = nearestStartNode?.node.id ?? defaultStartNodeId;
    const route = calculateShortestRoute({
      nodes: campusNodes,
      edges: campusEdges,
      startNodeId,
      endNodeId: destinationNodeId,
    });

    setActiveRoute(route);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!sessionUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--up-blue-dark)] text-sm text-[var(--up-gray)]/80">
        Cargando...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--up-blue-dark)] pb-6 text-white">
      <Header userName={sessionUser.name} onLogout={handleLogout} />
      <SearchBar
        locations={campusLocations}
        query={query}
        selectedLocation={selectedLocation}
        onQueryChange={setQuery}
        onSelectLocation={handleSelectLocation}
      />
      <CampusMap
        activeRoute={activeRoute}
        geolocationError={error}
        isLocating={isLocating}
        locations={campusLocations}
        selectedLocation={selectedLocation}
        userLocation={location}
        onStartTracking={startTracking}
      />
      <NavigationPanel
        activeRoute={activeRoute}
        nearestStartNode={nearestStartNode}
        routePreview={routePreview}
        selectedLocation={selectedLocation}
        usingGps={Boolean(location)}
        onCancelNavigation={() => {
          setActiveRoute(null);
          setIsCameraGuideOpen(false);
        }}
        onOpenCameraGuide={() => setIsCameraGuideOpen(true)}
        onStartNavigation={handleStartNavigation}
      />
      <LeoAvatar message={leoMessage} />
      {isCameraGuideOpen && activeRoute && (
        <CameraGuide
          activeRoute={activeRoute}
          destination={selectedLocation}
          onClose={() => setIsCameraGuideOpen(false)}
        />
      )}
    </main>
  );
}

function subscribeToSession(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSessionSnapshot() {
  return window.localStorage.getItem("leo.session");
}

function getServerSessionSnapshot() {
  return null;
}

function parseSession(snapshot: string | null) {
  if (!snapshot) {
    return null;
  }

  try {
    return JSON.parse(snapshot) as SessionUser;
  } catch {
    return null;
  }
}

function subscribeToDestination(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);

  return () => {
    window.removeEventListener("popstate", onStoreChange);
  };
}

function getDestinationSnapshot() {
  return new URLSearchParams(window.location.search).get("destination");
}

function getServerDestinationSnapshot() {
  return null;
}

function getLeoMessage({
  activeRoute,
  destinationName,
  distanceToDestination,
  geolocationError,
  hasLocation,
  isLocating,
  routePreview,
}: {
  activeRoute: CalculatedRoute | null;
  destinationName?: string;
  distanceToDestination: number | null;
  geolocationError: string | null;
  hasLocation: boolean;
  isLocating: boolean;
  routePreview: CalculatedRoute | null;
}) {
  if (distanceToDestination !== null && distanceToDestination <= 35) {
    return `Llegaste a ${destinationName}. Buen recorrido.`;
  }

  if (activeRoute && destinationName) {
    return `Ruta activa hacia ${destinationName}. Sigue la linea marcada y revisa los tramos abajo.`;
  }

  if (geolocationError) {
    return "No pude usar tu ubicacion. Puedes navegar desde la Entrada principal.";
  }

  if (isLocating) {
    return "Estoy buscando tu ubicacion para calcular mejor la ruta.";
  }

  if (!hasLocation && destinationName) {
    return `Destino listo: ${destinationName}. Activa Mi ubicacion para iniciar desde tu punto mas cercano.`;
  }

  if (routePreview && destinationName) {
    return `Te recomiendo esta ruta hacia ${destinationName}: ${routePreview.distance} metros aprox.`;
  }

  return "Hola, soy Leo. Busca una sede o elige un destino rapido para empezar.";
}
