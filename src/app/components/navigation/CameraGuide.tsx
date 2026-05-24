"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Camera, X } from "lucide-react";
import type { CampusLocation } from "@/data/campusLocations";
import type { CalculatedRoute } from "@/utils/dijkstra";

interface CameraGuideProps {
  activeRoute: CalculatedRoute;
  destination: CampusLocation | null;
  onClose: () => void;
}

export default function CameraGuide({
  activeRoute,
  destination,
  onClose,
}: CameraGuideProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const firstStep = activeRoute.steps[0];

  return (
    <section className="fixed inset-0 z-[2000] bg-black text-white">
      <video
        ref={videoRef}
        muted
        playsInline
        className="h-full w-full object-cover"
        aria-label="Camara guiada"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/70" />

      <header className="absolute left-0 right-0 top-0 flex items-center justify-between gap-4 p-4">
        <div className="rounded-2xl bg-black/45 px-4 py-3 backdrop-blur">
          <p className="text-xs text-white/70">Camara guiada</p>
          <h2 className="text-base font-bold">
            {destination?.name ?? "Ruta activa"}
          </h2>
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

      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/80 bg-[var(--up-red)]/85 shadow-2xl backdrop-blur">
          <ArrowUp size={72} strokeWidth={2.5} />
        </div>
        <div className="max-w-xs rounded-3xl bg-black/50 px-5 py-4 backdrop-blur">
          <p className="text-lg font-bold">Avanza al siguiente tramo</p>
          <p className="mt-2 text-sm text-white/75">
            {firstStep
              ? `${firstStep.distance} m aprox. hacia ${firstStep.toName}`
              : "Sigue la ruta marcada en el mapa."}
          </p>
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 p-4">
        <div className="rounded-3xl border border-white/10 bg-black/55 p-4 backdrop-blur">
          {error ? (
            <p className="text-sm text-red-100">{error}</p>
          ) : (
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Camera size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold">Leo te acompana</p>
                <p className="text-xs text-white/70">
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
