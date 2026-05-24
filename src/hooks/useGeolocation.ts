"use client";

import { useEffect, useRef, useState } from "react";

interface Coordinates {
  lat: number;
  lng: number;
}

export default function useGeolocation() {
  const watcherRef = useRef<number | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalizacion.");
      return;
    }

    setError(null);
    setIsLocating(true);

    if (watcherRef.current !== null) {
      navigator.geolocation.clearWatch(watcherRef.current);
    }

    watcherRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (geoError) => {
        setIsLocating(false);
        setError(geoError.message || "No se pudo obtener tu ubicacion.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );
  };

  useEffect(() => {
    return () => {
      if (watcherRef.current !== null) {
        navigator.geolocation.clearWatch(watcherRef.current);
      }
    };
  }, []);

  return {
    error,
    isLocating,
    location,
    startTracking,
  };
}
