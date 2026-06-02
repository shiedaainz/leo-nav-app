import { Camera, Clock3, LocateFixed, Navigation, Star, X } from "lucide-react";
import type { CampusLocation } from "@/data/campusLocations";
import type { CampusNode } from "@/data/campusGraph";
import type { CalculatedRoute } from "@/utils/dijkstra";

interface NavigationPanelProps {
  activeRoute: CalculatedRoute | null;
  nearestStartNode: {
    node: CampusNode;
    distance: number;
  } | null;
  isSelectedFavorite: boolean;
  routePreview: CalculatedRoute | null;
  selectedLocation: CampusLocation | null;
  usingGps: boolean;
  onCancelNavigation: () => void;
  onOpenCameraGuide: () => void;
  onStartNavigation: () => void;
  onStartTracking: () => void;
  onToggleFavorite: () => void;
}

export default function NavigationPanel({
  activeRoute,
  nearestStartNode,
  isSelectedFavorite,
  routePreview,
  selectedLocation,
  usingGps,
  onCancelNavigation,
  onOpenCameraGuide,
  onStartNavigation,
  onStartTracking,
  onToggleFavorite,
}: NavigationPanelProps) {
  const title = selectedLocation?.name ?? "Selecciona un destino";
  const originText = nearestStartNode
    ? `${nearestStartNode.node.name} (${nearestStartNode.distance} m de tu GPS)`
    : "Entrada principal";
  const estimatedMinutes =
    activeRoute?.estimatedMinutes ??
    routePreview?.estimatedMinutes ??
    selectedLocation?.estimatedMinutes ??
    0;
  const visibleRoute = activeRoute ?? routePreview;
  const distanceLabel = visibleRoute ? `${visibleRoute.distance} m` : null;
  const formatInstruction = (fromName: string, toName: string) => {
    const fromIsGeneric = isGenericNodeName(fromName);
    const toIsGeneric = isGenericNodeName(toName);

    if (fromIsGeneric && toIsGeneric) {
      return "Continua por el camino marcado";
    }

    if (fromIsGeneric) {
      return `Avanza hasta ${toName}`;
    }

    if (toIsGeneric) {
      return `Sal desde ${fromName} y continua por el camino`;
    }

    return `Dirigete de ${fromName} hacia ${toName}`;
  };

  return (
    <section className="fixed bottom-0 left-0 right-0 z-[1200] overflow-hidden rounded-t-2xl border-t border-white/10 bg-[var(--up-blue)]/95 shadow-2xl backdrop-blur-xl">
      <div className="mx-auto flex max-h-[62vh] max-w-4xl flex-col p-4 sm:max-h-[58vh] sm:p-5">
        <div className="mx-auto mb-3 h-1 w-12 shrink-0 rounded-full bg-white/25" />
        <div className="mb-3 flex shrink-0 items-start justify-between gap-3 sm:mb-4 sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs text-[var(--up-gray)]/80 sm:text-sm">
              {activeRoute ? "Navegando hacia" : "Destino"}
            </p>
            <h2 className="mt-1 truncate text-lg font-bold leading-tight sm:text-xl">{title}</h2>
            <p className="mt-1 line-clamp-1 text-xs text-[var(--up-gray)]/80">
              Origen: {originText}
            </p>
            {!usingGps && (
              <p className="mt-2 text-xs text-amber-300">
                Pulsa el boton de ubicacion para iniciar desde tu punto mas cercano.
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!selectedLocation}
              onClick={onToggleFavorite}
              className="rounded-2xl bg-white/10 p-3 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={
                isSelectedFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
              }
            >
              <Star
                size={18}
                className={isSelectedFavorite ? "fill-yellow-300 text-yellow-300" : ""}
              />
            </button>
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 sm:px-4 sm:py-3">
              <Clock3 size={18} />
              <span className="text-sm">
                {estimatedMinutes > 0 ? `${estimatedMinutes} min` : "--"}
              </span>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {activeRoute ? (
            <div className="flex h-full min-h-0 flex-col rounded-xl border border-white/10 bg-[var(--up-blue-dark)]/60 p-4">
              <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
                <p className="text-sm font-semibold">Instrucciones</p>
                {distanceLabel && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-[var(--up-gray)]">
                    {distanceLabel}
                  </span>
                )}
              </div>

              <ol className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
                {activeRoute.steps.map((step, index) => (
                  <li key={`${step.fromNodeId}-${step.toNodeId}`} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--up-red)] text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="min-w-0 text-sm text-[var(--up-gray)]">
                      {formatInstruction(step.fromName, step.toName)}
                      <span className="block text-xs text-[var(--up-gray-dark)]">
                        {step.distance} m aprox.
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="line-clamp-2 text-sm text-[var(--up-gray)]/80">
                {selectedLocation?.description ??
                  "Busca o elige un destino para calcular una ruta."}
              </p>

              {routePreview && (
                <div className="rounded-xl border border-white/10 bg-[var(--up-blue-dark)]/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Ruta recomendada</p>
                      <p className="mt-1 text-xs text-[var(--up-gray)]/75">
                        {routePreview.steps.length} tramos desde {originText}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs text-[var(--up-gray)]">
                      {routePreview.distance} m
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 grid shrink-0 grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            disabled={!selectedLocation}
            onClick={onStartNavigation}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--up-red)] px-3 py-3 text-sm font-semibold transition hover:bg-[var(--up-red-dark)] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-[var(--up-gray)]/80 sm:text-base"
          >
            <Navigation size={20} />
            {activeRoute ? "Actualizar" : "Iniciar ruta"}
          </button>

          {activeRoute ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenCameraGuide}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-sm font-semibold transition hover:bg-white/20"
              >
                <Camera size={20} />
                Camara
              </button>
              <button
                type="button"
                onClick={onCancelNavigation}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-sm font-semibold transition hover:bg-white/20"
              >
                <X size={20} />
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartTracking}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-sm font-semibold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              <LocateFixed size={20} />
              Ubicarme
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function isGenericNodeName(name: string) {
  return /^Nodo \d+$/i.test(name.trim());
}




