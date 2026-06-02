import type { CampusEdge, CampusNode } from "@/data/campusGraph";

export interface RouteStep {
  fromNodeId: string;
  fromName: string;
  instruction: string;
  toNodeId: string;
  toName: string;
  distance: number;
}

export interface CalculatedRoute {
  nodeIds: string[];
  coordinates: Array<[number, number]>;
  distance: number;
  estimatedMinutes: number;
  steps: RouteStep[];
}

export function calculateShortestRoute({
  nodes,
  edges,
  startNodeId,
  endNodeId,
}: {
  nodes: CampusNode[];
  edges: CampusEdge[];
  startNodeId: string;
  endNodeId: string;
}): CalculatedRoute | null {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  if (!nodeById.has(startNodeId) || !nodeById.has(endNodeId)) {
    return null;
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set(nodes.map((node) => node.id));

  for (const node of nodes) {
    distances.set(node.id, Number.POSITIVE_INFINITY);
    previous.set(node.id, null);
  }

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    const currentNodeId = [...unvisited].reduce((bestNodeId, nodeId) => {
      const bestDistance = distances.get(bestNodeId) ?? Number.POSITIVE_INFINITY;
      const nodeDistance = distances.get(nodeId) ?? Number.POSITIVE_INFINITY;

      return nodeDistance < bestDistance ? nodeId : bestNodeId;
    });

    if (currentNodeId === endNodeId) {
      break;
    }

    unvisited.delete(currentNodeId);

    const currentDistance = distances.get(currentNodeId) ?? Number.POSITIVE_INFINITY;

    if (!Number.isFinite(currentDistance)) {
      break;
    }

    const neighbors = edges.filter(
      (edge) => edge.from === currentNodeId || edge.to === currentNodeId,
    );

    for (const edge of neighbors) {
      const neighborId = edge.from === currentNodeId ? edge.to : edge.from;

      if (!unvisited.has(neighborId)) {
        continue;
      }

      const candidateDistance = currentDistance + edge.distance;
      const knownDistance = distances.get(neighborId) ?? Number.POSITIVE_INFINITY;

      if (candidateDistance < knownDistance) {
        distances.set(neighborId, candidateDistance);
        previous.set(neighborId, currentNodeId);
      }
    }
  }

  const nodeIds: string[] = [];
  let cursor: string | null = endNodeId;

  while (cursor) {
    nodeIds.unshift(cursor);
    cursor = previous.get(cursor) ?? null;
  }

  if (nodeIds[0] !== startNodeId) {
    return null;
  }

  const distance = distances.get(endNodeId) ?? 0;
  const coordinates = nodeIds.map((nodeId) => {
    const node = nodeById.get(nodeId)!;
    return [node.lat, node.lng] as [number, number];
  });
  const steps = createRouteSteps(nodeIds, nodeById, edges);

  return {
    nodeIds,
    coordinates,
    distance,
    estimatedMinutes: Math.max(1, Math.round(distance / 80)),
    steps,
  };
}

function createRouteSteps(
  nodeIds: string[],
  nodeById: Map<string, CampusNode>,
  edges: CampusEdge[],
) {
  const steps: RouteStep[] = [];

  let fromIndex = 0;

  for (let index = 1; index < nodeIds.length; index += 1) {
    const node = nodeById.get(nodeIds[index])!;
    const isLastNode = index === nodeIds.length - 1;
    const turnDirection = !isLastNode
      ? getTurnDirection({
          previousNode: nodeById.get(nodeIds[index - 1])!,
          currentNode: node,
          nextNode: nodeById.get(nodeIds[index + 1])!,
        })
      : null;

    if (!isLastNode && isGenericNodeName(node.name) && !turnDirection) {
      continue;
    }

    const fromNodeId = nodeIds[fromIndex];
    const toNodeId = nodeIds[index];
    const fromNode = nodeById.get(fromNodeId)!;
    const toNode = nodeById.get(toNodeId)!;

    steps.push({
      fromNodeId,
      fromName: fromNode.name,
      instruction: createInstruction({
        fromName: fromNode.name,
        isLastNode,
        toName: toNode.name,
        turnDirection,
      }),
      toNodeId,
      toName: toNode.name,
      distance: calculateSegmentDistance(nodeIds.slice(fromIndex, index + 1), edges),
    });

    fromIndex = index;
  }

  return steps;
}

function calculateSegmentDistance(nodeIds: string[], edges: CampusEdge[]) {
  let distance = 0;

  for (let index = 0; index < nodeIds.length - 1; index += 1) {
    const fromNodeId = nodeIds[index];
    const toNodeId = nodeIds[index + 1];
    const edge = edges.find(
      (candidate) =>
        (candidate.from === fromNodeId && candidate.to === toNodeId) ||
        (candidate.from === toNodeId && candidate.to === fromNodeId),
    );

    distance += edge?.distance ?? 0;
  }

  return distance;
}

function isGenericNodeName(name: string) {
  return /^Nodo \d+$/i.test(name.trim());
}

function createInstruction({
  fromName,
  isLastNode,
  toName,
  turnDirection,
}: {
  fromName: string;
  isLastNode: boolean;
  toName: string;
  turnDirection: "left" | "right" | null;
}) {
  if (isLastNode) {
    return isGenericNodeName(toName)
      ? "Continua hasta el destino"
      : `Continua hasta ${toName}`;
  }

  if (turnDirection === "left") {
    return "Avanza y gira a la izquierda";
  }

  if (turnDirection === "right") {
    return "Avanza y gira a la derecha";
  }

  if (isGenericNodeName(fromName) && isGenericNodeName(toName)) {
    return "Continua por el camino marcado";
  }

  if (isGenericNodeName(fromName)) {
    return `Avanza hasta ${toName}`;
  }

  if (isGenericNodeName(toName)) {
    return `Sal desde ${fromName} y continua por el camino`;
  }

  return `Dirigete de ${fromName} hacia ${toName}`;
}

function getTurnDirection({
  previousNode,
  currentNode,
  nextNode,
}: {
  previousNode: CampusNode;
  currentNode: CampusNode;
  nextNode: CampusNode;
}) {
  const incomingBearing = calculateBearing(previousNode, currentNode);
  const outgoingBearing = calculateBearing(currentNode, nextNode);
  const angle = normalizeAngle(outgoingBearing - incomingBearing);

  if (Math.abs(angle) < 35 || Math.abs(angle) > 145) {
    return null;
  }

  return angle > 0 ? "right" : "left";
}

function calculateBearing(fromNode: CampusNode, toNode: CampusNode) {
  const fromLat = toRadians(fromNode.lat);
  const toLat = toRadians(toNode.lat);
  const deltaLng = toRadians(toNode.lng - fromNode.lng);
  const y = Math.sin(deltaLng) * Math.cos(toLat);
  const x =
    Math.cos(fromLat) * Math.sin(toLat) -
    Math.sin(fromLat) * Math.cos(toLat) * Math.cos(deltaLng);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

function normalizeAngle(angle: number) {
  return ((angle + 540) % 360) - 180;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number) {
  return (value * 180) / Math.PI;
}
