"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Camera,
  CornerUpLeft,
  CornerUpRight,
  Map,
  Route,
  X,
} from "lucide-react";
import type { CampusLocation } from "@/data/campusLocations";
import type { CalculatedRoute } from "@/utils/dijkstra";

interface CameraGuideProps {
  activeRoute: CalculatedRoute;
  currentStepIndex: number;
  destination: CampusLocation | null;
  distanceToNextStep: number | null;
  onClose: () => void;
}

export default function CameraGuide({
  activeRoute,
  currentStepIndex,
  destination,
  distanceToNextStep,
  onClose,
}: CameraGuideProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function startCamera() {
      if (!window.isSecureContext) {
        setError(
          "La camara requiere HTTPS en celular. Prueba desde localhost, una URL HTTPS o una version desplegada.",
        );
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Este navegador no permite abrir la camara desde esta pagina.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsCameraReady(true);
        }
      } catch {
        setError("No pude acceder a la camara. Revisa los permisos del navegador.");
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const currentStep = activeRoute.steps[currentStepIndex] ?? activeRoute.steps[0];
  const nextSteps = activeRoute.steps.slice(currentStepIndex, currentStepIndex + 3);
  const instruction = currentStep?.instruction ?? "Sigue la ruta marcada en el mapa.";
  const instructionLower = instruction.toLowerCase();
  const DirectionIcon = instructionLower.includes("izquierda")
    ? CornerUpLeft
    : instructionLower.includes("derecha")
      ? CornerUpRight
      : ArrowUp;

  return (
    <section className="fixed inset-0 z-[2000] bg-black text-white">
      <video
        ref={videoRef}
        muted
        playsInline
        className="h-full w-full object-cover"
        aria-label="Camara guiada"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/5 to-black/80" />

      <header className="absolute left-0 right-0 top-0 flex items-center justify-between gap-4 p-4">
        <div className="min-w-0 rounded-2xl bg-black/50 px-4 py-3 backdrop-blur">
          <p className="text-xs text-white/70">Camara guiada por Leo</p>
          <h2 className="truncate text-base font-bold">
            {destination?.name ?? "Ruta activa"}
          </h2>
          <p className="mt-1 text-xs text-white/65">
            {activeRoute.distance} m · {activeRoute.estimatedMinutes} min aprox.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-black/45 p-3 backdrop-blur transition hover:bg-black/65"
          aria-label="Cerrar camara"
        >
          <X size={24} />
        </button>
      </header>

      {!isCameraReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/45">
          <div className="rounded-3xl bg-black/60 px-5 py-4 text-sm font-semibold backdrop-blur">
            Activando camara...
          </div>
        </div>
      )}

      <div className="absolute left-1/2 top-[46%] flex w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/85 bg-[var(--up-red)]/90 shadow-2xl backdrop-blur sm:h-32 sm:w-32">
          <DirectionIcon size={74} strokeWidth={2.5} />
        </div>
        <div className="w-full rounded-3xl bg-black/55 px-5 py-4 shadow-2xl backdrop-blur">
          <p className="text-xl font-bold leading-tight sm:text-2xl">{instruction}</p>
          <p className="mt-2 text-sm text-white/75">
            {currentStep
              ? `${distanceToNextStep ?? currentStep.distance} m aprox.`
              : "Sigue la ruta marcada en el mapa."}
          </p>
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 p-4">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-black/60 p-4 backdrop-blur">
          {error ? (
            <p className="text-sm text-red-100">{error}</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-xs text-white/65">
                    <Route size={16} />
                    Paso actual
                  </div>
                  <p className="mt-2 text-lg font-bold">
                    {Math.min(currentStepIndex + 1, Math.max(activeRoute.steps.length, 1))} de{" "}
                    {Math.max(activeRoute.steps.length, 1)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-xs text-white/65">
                    <Camera size={16} />
                    Referencia
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold">
                    {currentStep?.toName ?? destination?.name ?? "Ruta"}
                  </p>
                </div>
              </div>

              {nextSteps.length > 1 && (
                <ol className="space-y-2">
                  {nextSteps.slice(1).map((step, index) => (
                    <li
                      key={`${step.fromNodeId}-${step.toNodeId}`}
                      className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2 text-sm text-white/75"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                        {currentStepIndex + index + 2}
                      </span>
                      <span className="min-w-0 truncate">{step.instruction}</span>
                    </li>
                  ))}
                </ol>
              )}

              <button
                type="button"
                onClick={onClose}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[var(--up-blue-dark)] transition hover:bg-[var(--up-gray)]"
              >
                <Map size={20} />
                Volver al mapa
              </button>

              <div>
                <p className="text-xs text-white/60">
                  Usa esta vista como apoyo visual. Confirma siempre la ruta en el mapa.
                </p>
              </div>
            </div>
          )}
        </div>
      </footer>
    </section>
  );
}
