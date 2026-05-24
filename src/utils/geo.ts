import type { CampusNode } from "@/data/campusGraph";

export interface Coordinates {
  lat: number;
  lng: number;
}

export function calculateDistanceInMeters(
  origin: Coordinates,
  destination: Coordinates,
) {
  const earthRadiusInMeters = 6371000;
  const originLat = toRadians(origin.lat);
  const destinationLat = toRadians(destination.lat);
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLng = toRadians(destination.lng - origin.lng);

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(originLat) *
      Math.cos(destinationLat) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const angle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Math.round(earthRadiusInMeters * angle);
}

export function findNearestNode(
  coordinates: Coordinates,
  nodes: CampusNode[],
) {
  return nodes.reduce<{
    node: CampusNode;
    distance: number;
  } | null>((nearest, node) => {
    const distance = calculateDistanceInMeters(coordinates, {
      lat: node.lat,
      lng: node.lng,
    });

    if (!nearest || distance < nearest.distance) {
      return {
        node,
        distance,
      };
    }

    return nearest;
  }, null);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
