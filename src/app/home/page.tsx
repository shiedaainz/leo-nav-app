"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/ui/Header";
import SearchBar from "../components/ui/SearchBar";
import CampusMap from "../components/map/CampusMap";
import NavigationPanel from "../components/navigation/NavigationPanel";
import LeoAvatar from "../components/leo/LeoAvatar";
import CameraGuide from "../components/navigation/CameraGuide";
import {
  campusLocations,
  destinationNodeById,
  type CampusLocation,
} from "@/data/campusLocations";
import {
  campusEdges,
  campusNodes,
  defaultStartNodeId,
} from "@/data/campusGraph";
import useGeolocation from "@/hooks/useGeolocation";
import {
  calculateShortestRoute,
  type CalculatedRoute,
  type RouteStep,
} from "@/utils/dijkstra";
import { calculateDistanceInMeters, findNearestNode } from "@/utils/geo";
import { logout, type SessionUser } from "@/utils/auth";
import {
  addFavoriteLocation,
  getFavoriteLocationIds,
  removeFavoriteLocation,
} from "@/utils/favorites";

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
  const [favoriteLocationIds, setFavoriteLocationIds] = useState<string[]>([]);
  const [isLeoListening, setIsLeoListening] = useState(false);
  const [leoVoiceMessage, setLeoVoiceMessage] = useState<string | null>(null);
  const lastSpokenStepKeyRef = useRef<string | null>(null);
  const { error, isLocating, location, startTracking } = useGeolocation();

  useEffect(() => {
    if (sessionSnapshot === null) {
      router.replace("/login");
    }
  }, [router, sessionSnapshot]);

  useEffect(() => {
    if (!sessionUser) {
      return;
    }

    let isMounted = true;

    getFavoriteLocationIds().then((locationIds) => {
      if (isMounted) {
        setFavoriteLocationIds(locationIds);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [sessionUser]);

  const sortedLocations = useMemo(() => {
    const favoriteSet = new Set(favoriteLocationIds);

    return [...campusLocations].sort((firstLocation, secondLocation) => {
      const firstIsFavorite = favoriteSet.has(firstLocation.id);
      const secondIsFavorite = favoriteSet.has(secondLocation.id);

      if (firstIsFavorite === secondIsFavorite) {
        return 0;
      }

      return firstIsFavorite ? -1 : 1;
    });
  }, [favoriteLocationIds]);

  const selectedLocation = useMemo(() => {
    const selectedId = manualLocationId ?? destinationSnapshot ?? campusLocations[0]?.id;

    return (
      campusLocations.find((campusLocation) => campusLocation.id === selectedId) ??
      campusLocations[0] ??
      null
    );
  }, [destinationSnapshot, manualLocationId]);

  const mapLocations = useMemo(
    () =>
      campusLocations.filter(
        (campusLocation) =>
          campusLocation.showOnMap !== false ||
          campusLocation.id === selectedLocation?.id,
      ),
    [selectedLocation],
  );

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

    const destinationNodeId = destinationNodeById[selectedLocation.id];

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

  const routeProgress = useMemo(
    () => getRouteProgress(activeRoute, location),
    [activeRoute, location],
  );

  const currentRouteStep =
    activeRoute?.steps[routeProgress.currentStepIndex] ?? activeRoute?.steps[0] ?? null;

  useEffect(() => {
    if (!activeRoute || !selectedLocation || !currentRouteStep || !location) {
      return;
    }

    const stepKey = `${currentRouteStep.fromNodeId}-${currentRouteStep.toNodeId}`;

    if (stepKey === lastSpokenStepKeyRef.current) {
      return;
    }

    lastSpokenStepKeyRef.current = stepKey;

    if (routeProgress.currentStepIndex === 0) {
      return;
    }

    const message = getStepProgressMessage(currentRouteStep, routeProgress.distanceToNextStep);
    const timeoutId = window.setTimeout(() => {
      setLeoVoiceMessage(message);
      speakLeoMessage(message);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    activeRoute,
    currentRouteStep,
    location,
    routeProgress.currentStepIndex,
    routeProgress.distanceToNextStep,
    selectedLocation,
  ]);

  const routeLeoMessage = useMemo(
    () =>
      getLeoMessage({
        activeRoute,
        currentStep: currentRouteStep,
        distanceToNextStep: routeProgress.distanceToNextStep,
        destinationName: selectedLocation?.name,
        distanceToDestination,
        geolocationError: error,
        hasLocation: Boolean(location),
        isLocating,
        routePreview,
      }),
    [
      activeRoute,
      currentRouteStep,
      distanceToDestination,
      error,
      isLocating,
      location,
      routeProgress.distanceToNextStep,
      routePreview,
      selectedLocation,
    ],
  );
  const leoMessage = leoVoiceMessage ?? routeLeoMessage;

  function speakLeoMessage(message: string) {
    if (!("speechSynthesis" in window)) {
      return false;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "es-CO";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  const handleSelectLocation = (locationToSelect: CampusLocation) => {
    setManualLocationId(locationToSelect.id);
    setActiveRoute(null);
    setIsCameraGuideOpen(false);
    lastSpokenStepKeyRef.current = null;
    setQuery("");
    const message = `${locationToSelect.name} seleccionado. Cuando quieras, iniciamos la ruta.`;
    setLeoVoiceMessage(message);
    speakLeoMessage(message);
  };

  const handleStartNavigation = () => {
    if (!selectedLocation) {
      return;
    }

    const destinationNodeId = destinationNodeById[selectedLocation.id];

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
    lastSpokenStepKeyRef.current = null;

    const message = getRouteStartMessage(selectedLocation.name, route);
    setLeoVoiceMessage(message);
    speakLeoMessage(message);
  };

  const handleOpenCameraGuide = () => {
    if (!activeRoute || !selectedLocation) {
      return;
    }

    setIsCameraGuideOpen(true);
    const message = getCameraGuideMessage(
      selectedLocation.name,
      activeRoute,
      routeProgress.currentStepIndex,
      routeProgress.distanceToNextStep,
    );
    setLeoVoiceMessage(message);
    speakLeoMessage(message);
  };

  const handleCloseCameraGuide = () => {
    setIsCameraGuideOpen(false);
    const message = "Volvemos al mapa. Sigue la ruta marcada y revisa las instrucciones cuando lo necesites.";
    setLeoVoiceMessage(message);
    speakLeoMessage(message);
  };

  const handleToggleFavorite = async () => {
    if (!selectedLocation) {
      return;
    }

    const isFavorite = favoriteLocationIds.includes(selectedLocation.id);

    if (isFavorite) {
      setFavoriteLocationIds((currentIds) =>
        currentIds.filter((locationId) => locationId !== selectedLocation.id),
      );
      await removeFavoriteLocation(selectedLocation.id);
      return;
    }

    setFavoriteLocationIds((currentIds) => [
      ...new Set([...currentIds, selectedLocation.id]),
    ]);
    await addFavoriteLocation(selectedLocation.id);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleLeoSpeak = () => {
    const didSpeak = speakLeoMessage(leoMessage);

    if (!didSpeak) {
      setLeoVoiceMessage("No puedo hablar en este navegador por ahora.");
    }
  };

  const handleLeoListen = () => {
    const SpeechRecognitionConstructor = getSpeechRecognitionConstructor();

    if (!SpeechRecognitionConstructor) {
      setLeoVoiceMessage("No puedo escuchar comandos en este navegador.");
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "es-CO";
    recognition.continuous = false;
    recognition.interimResults = false;
    setIsLeoListening(true);
    setLeoVoiceMessage("Te escucho. Puedes decir un destino, horarios, perfil o iniciar ruta.");

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      handleLeoCommand(transcript);
    };

    recognition.onerror = () => {
      setLeoVoiceMessage("No te escuche bien. Intentalo de nuevo.");
    };

    recognition.onend = () => {
      setIsLeoListening(false);
    };

    recognition.start();
  };

  const handleLeoCommand = (rawCommand: string) => {
    const command = normalizeCommand(rawCommand);

    if (command.includes("horario")) {
      router.push("/schedule");
      return;
    }

    if (command.includes("perfil")) {
      router.push("/profile");
      return;
    }

    if (command.includes("ubicacion") || command.includes("ubicación")) {
      startTracking();
      const message = "Voy a buscar tu ubicacion para guiarte mejor.";
      setLeoVoiceMessage(message);
      speakLeoMessage(message);
      return;
    }

    if (
      command.includes("iniciar") ||
      command.includes("navegar") ||
      command.includes("ruta")
    ) {
      handleStartNavigation();
      return;
    }

    const matchedLocation = findLocationByVoiceCommand(command, campusLocations);

    if (matchedLocation) {
      handleSelectLocation(matchedLocation);
      return;
    }

    const message = `Escuche: ${rawCommand}. Intenta decir un destino, horarios o iniciar ruta.`;
    setLeoVoiceMessage(message);
    speakLeoMessage(message);
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
        favoriteLocationIds={favoriteLocationIds}
        locations={sortedLocations}
        query={query}
        selectedLocation={selectedLocation}
        onQueryChange={setQuery}
        onSelectLocation={handleSelectLocation}
      />
      <CampusMap
        activeRoute={activeRoute}
        geolocationError={error}
        isLocating={isLocating}
        locations={mapLocations}
        selectedLocation={selectedLocation}
        userLocation={location}
        onStartTracking={startTracking}
      />
      <NavigationPanel
        activeRoute={activeRoute}
        nearestStartNode={nearestStartNode}
        routePreview={routePreview}
        isSelectedFavorite={
          selectedLocation ? favoriteLocationIds.includes(selectedLocation.id) : false
        }
        selectedLocation={selectedLocation}
        usingGps={Boolean(location)}
        onCancelNavigation={() => {
          setActiveRoute(null);
          setIsCameraGuideOpen(false);
          lastSpokenStepKeyRef.current = null;
        }}
        onOpenCameraGuide={handleOpenCameraGuide}
        currentStepIndex={routeProgress.currentStepIndex}
        distanceToNextStep={routeProgress.distanceToNextStep}
        onStartNavigation={handleStartNavigation}
        onStartTracking={startTracking}
        onToggleFavorite={handleToggleFavorite}
      />
      <LeoAvatar
        isListening={isLeoListening}
        message={leoMessage}
        onListen={handleLeoListen}
        onSpeak={handleLeoSpeak}
      />
      {isCameraGuideOpen && activeRoute && (
        <CameraGuide
          activeRoute={activeRoute}
          currentStepIndex={routeProgress.currentStepIndex}
          destination={selectedLocation}
          distanceToNextStep={routeProgress.distanceToNextStep}
          onClose={handleCloseCameraGuide}
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
  currentStep,
  distanceToNextStep,
  destinationName,
  distanceToDestination,
  geolocationError,
  hasLocation,
  isLocating,
  routePreview,
}: {
  activeRoute: CalculatedRoute | null;
  currentStep: RouteStep | null;
  distanceToNextStep: number | null;
  destinationName?: string;
  distanceToDestination: number | null;
  geolocationError: string | null;
  hasLocation: boolean;
  isLocating: boolean;
  routePreview: CalculatedRoute | null;
}) {
  if (distanceToDestination !== null && distanceToDestination <= 35) {
    return `Ya estas cerca de ${destinationName}. Hemos llegado.`;
  }

  if (activeRoute && destinationName) {
    if (currentStep) {
      const distanceText =
        distanceToNextStep !== null
          ? ` Te faltan unos ${distanceToNextStep} metros para la siguiente referencia.`
          : "";

      return `Vamos hacia ${destinationName}. ${currentStep.instruction}.${distanceText}`;
    }

    return `Vamos hacia ${destinationName}. Sigue la linea marcada en el mapa.`;
  }

  if (geolocationError) {
    return "No pude usar tu ubicacion. Puedo guiarte desde la Entrada principal.";
  }

  if (isLocating) {
    return "Estoy buscando tu ubicacion para darte una ruta mas precisa.";
  }

  if (!hasLocation && destinationName) {
    return `${destinationName} esta listo. Activa Mi ubicacion para empezar desde tu punto mas cercano.`;
  }

  if (routePreview && destinationName) {
    return `Tengo una ruta hacia ${destinationName}: ${routePreview.distance} metros aproximadamente.`;
  }

  return "Hola, soy Leo. Elige un destino y te acompano en el recorrido.";
}

function getRouteStartMessage(
  destinationName: string,
  route: CalculatedRoute | null,
) {
  if (!route) {
    return `No pude calcular la ruta hacia ${destinationName}. Prueba activar Mi ubicacion o elegir otro destino.`;
  }

  const firstStep = route.steps[0];

  if (!firstStep) {
    return `Ruta lista hacia ${destinationName}. Sigue la linea marcada en el mapa.`;
  }

  return `Vamos hacia ${destinationName}. ${firstStep.instruction}. El recorrido es de unos ${route.distance} metros.`;
}

function getCameraGuideMessage(
  destinationName: string,
  route: CalculatedRoute,
  currentStepIndex: number,
  distanceToNextStep: number | null,
) {
  const currentStep = route.steps[currentStepIndex] ?? route.steps[0];

  if (!currentStep) {
    return `Modo camara activado. Vamos hacia ${destinationName}. Sigue la ruta marcada en pantalla.`;
  }

  const distance = distanceToNextStep ?? currentStep.distance;

  return `Modo camara activado. Vamos hacia ${destinationName}. ${currentStep.instruction}. Son aproximadamente ${distance} metros hasta la siguiente referencia.`;
}

function getStepProgressMessage(step: RouteStep, distanceToNextStep: number | null) {
  if (distanceToNextStep !== null && distanceToNextStep <= 25) {
    return `Estas cerca de ${step.toName}. Preparate para el siguiente tramo.`;
  }

  const distanceText =
    distanceToNextStep !== null
      ? ` Te faltan unos ${distanceToNextStep} metros.`
      : "";

  return `${step.instruction}.${distanceText}`;
}

function getRouteProgress(
  route: CalculatedRoute | null,
  userLocation: { lat: number; lng: number } | null,
) {
  if (!route || !userLocation || route.steps.length === 0) {
    return {
      currentStepIndex: 0,
      distanceToNextStep: null,
    };
  }

  const routeNodes = campusNodes.filter((node) => route.nodeIds.includes(node.id));
  const nearestRouteNode = findNearestNode(userLocation, routeNodes);

  if (!nearestRouteNode) {
    return {
      currentStepIndex: 0,
      distanceToNextStep: null,
    };
  }

  const nearestNodeIndex = route.nodeIds.indexOf(nearestRouteNode.node.id);
  const nextStepIndex = route.steps.findIndex((step) => {
    const stepTargetIndex = route.nodeIds.indexOf(step.toNodeId);

    return stepTargetIndex > nearestNodeIndex;
  });
  const currentStepIndex =
    nextStepIndex === -1 ? Math.max(route.steps.length - 1, 0) : nextStepIndex;
  const currentStep = route.steps[currentStepIndex];
  const currentStepNode = campusNodes.find((node) => node.id === currentStep?.toNodeId);

  return {
    currentStepIndex,
    distanceToNextStep: currentStepNode
      ? calculateDistanceInMeters(userLocation, {
          lat: currentStepNode.lat,
          lng: currentStepNode.lng,
        })
      : null,
  };
}

interface SpeechRecognitionResultEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface BrowserSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  start: () => void;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getSpeechRecognitionConstructor() {
  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function normalizeCommand(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findLocationByVoiceCommand(
  command: string,
  locations: CampusLocation[],
) {
  return locations.find((locationToFind) => {
    const normalizedName = normalizeCommand(locationToFind.name);
    const normalizedDescription = normalizeCommand(locationToFind.description);

    if (normalizedName.includes(command) || command.includes(normalizedName)) {
      return true;
    }

    if (normalizedDescription.includes(command)) {
      return true;
    }

    if (locationToFind.id === "virgen-del-rosario" && command.includes("rosario")) {
      return true;
    }

    if (locationToFind.id === "club-del-comercio" && command.includes("club")) {
      return true;
    }

    if (locationToFind.id === "entrada-principal" && command.includes("entrada")) {
      return true;
    }

    if (locationToFind.id === "plaza-central" && command.includes("plaza")) {
      return true;
    }

    return false;
  });
}
