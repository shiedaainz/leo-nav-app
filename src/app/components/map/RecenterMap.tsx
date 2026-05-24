"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
}

export default function RecenterMap({ lat, lng, zoom }: Props) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], zoom ?? map.getZoom(), {
      animate: true,
    });
  }, [lat, lng, map, zoom]);

  return null;
}
