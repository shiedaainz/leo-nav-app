"use client";

import { useMemo, useState } from "react";
import { CircleMarker, Polyline, Popup, useMapEvents } from "react-leaflet";
import { calculateDistanceInMeters } from "@/utils/geo";

interface DraftNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface DraftEdge {
  from: string;
  to: string;
  distance: number;
}

interface MapClickCaptureProps {
  enabled: boolean;
  onAddNode: (lat: number, lng: number) => void;
}

function MapClickCapture({ enabled, onAddNode }: MapClickCaptureProps) {
  useMapEvents({
    click(event) {
      if (!enabled) {
        return;
      }

      onAddNode(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export default function GraphEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNodes, setIsAddingNodes] = useState(false);
  const [nodes, setNodes] = useState<DraftNode[]>([]);
  const [edges, setEdges] = useState<DraftEdge[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  const exportCode = useMemo(() => {
    const nodeCode = nodes
      .map(
        (node) => `  {\n    id: "${node.id}",\n    name: "${node.name}",\n    lat: ${node.lat.toFixed(6)},\n    lng: ${node.lng.toFixed(6)},\n  },`,
      )
      .join("\n");

    const edgeCode = edges
      .map(
        (edge) =>
          `  { from: "${edge.from}", to: "${edge.to}", distance: ${edge.distance} },`,
      )
      .join("\n");

    return `export const campusNodes: CampusNode[] = [\n${nodeCode}\n];\n\nexport const campusEdges: CampusEdge[] = [\n${edgeCode}\n];`;
  }, [edges, nodes]);

  const addNode = (lat: number, lng: number) => {
    const nextNumber = nodes.length + 1;
    const id = `nodo-${nextNumber}`;

    setNodes((currentNodes) => [
      ...currentNodes,
      {
        id,
        name: `Nodo ${nextNumber}`,
        lat,
        lng,
      },
    ]);
  };

  const updateNodeName = (nodeId: string, name: string) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              id: slugify(name) || node.id,
              name,
            }
          : node,
      ),
    );
  };

  const toggleNodeSelection = (nodeId: string) => {
    setSelectedNodeIds((currentSelection) => {
      if (currentSelection.includes(nodeId)) {
        return currentSelection.filter((selectedNodeId) => selectedNodeId !== nodeId);
      }

      return [...currentSelection, nodeId].slice(-2);
    });
  };

  const connectSelectedNodes = () => {
    if (selectedNodeIds.length !== 2) {
      return;
    }

    const [from, to] = selectedNodeIds;
    const fromNode = nodes.find((node) => node.id === from);
    const toNode = nodes.find((node) => node.id === to);

    if (!fromNode || !toNode) {
      return;
    }

    const alreadyExists = edges.some(
      (edge) =>
        (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from),
    );

    if (alreadyExists) {
      setSelectedNodeIds([]);
      return;
    }

    setEdges((currentEdges) => [
      ...currentEdges,
      {
        from,
        to,
        distance: calculateDistanceInMeters(fromNode, toNode),
      },
    ]);
    setSelectedNodeIds([]);
  };

  const removeLastNode = () => {
    const nodeToRemove = nodes.at(-1);

    if (!nodeToRemove) {
      return;
    }

    setNodes((currentNodes) => currentNodes.slice(0, -1));
    setEdges((currentEdges) =>
      currentEdges.filter(
        (edge) => edge.from !== nodeToRemove.id && edge.to !== nodeToRemove.id,
      ),
    );
    setSelectedNodeIds((currentSelection) =>
      currentSelection.filter((nodeId) => nodeId !== nodeToRemove.id),
    );
  };

  return (
    <>
      <MapClickCapture enabled={isAddingNodes} onAddNode={addNode} />

      {edges.map((edge) => {
        const fromNode = nodes.find((node) => node.id === edge.from);
        const toNode = nodes.find((node) => node.id === edge.to);

        if (!fromNode || !toNode) {
          return null;
        }

        return (
          <Polyline
            key={`${edge.from}-${edge.to}`}
            positions={[
              [fromNode.lat, fromNode.lng],
              [toNode.lat, toNode.lng],
            ]}
            pathOptions={{ color: "#f97316", weight: 4, opacity: 0.85 }}
          />
        );
      })}

      {nodes.map((node, index) => {
        const isSelected = selectedNodeIds.includes(node.id);

        return (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={isSelected ? 9 : 7}
            pathOptions={{
              color: isSelected ? "#ffffff" : "#0f172a",
              fillColor: isSelected ? "#ef4444" : "#f97316",
              fillOpacity: 1,
              weight: 3,
            }}
            eventHandlers={{
              click() {
                toggleNodeSelection(node.id);
              },
            }}
          >
            <Popup>
              <strong>{index + 1}. {node.name}</strong>
              <br />
              {node.lat.toFixed(6)}, {node.lng.toFixed(6)}
            </Popup>
          </CircleMarker>
        );
      })}

      <div className="absolute right-4 top-4 z-[1000] w-[min(360px,calc(100%-2rem))] rounded-2xl border border-slate-700 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Editor de grafo</p>
            <p className="text-xs text-slate-400">Solo desarrollo</p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold transition hover:bg-slate-800"
          >
            {isOpen ? "Ocultar" : "Abrir"}
          </button>
        </div>

        {isOpen && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsAddingNodes((current) => !current)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isAddingNodes ? "bg-red-500 text-white" : "bg-slate-800 text-slate-200"
                }`}
              >
                {isAddingNodes ? "Clic activo" : "Agregar nodos"}
              </button>

              <button
                type="button"
                onClick={connectSelectedNodes}
                disabled={selectedNodeIds.length !== 2}
                className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Conectar 2 nodos
              </button>

              <button
                type="button"
                onClick={removeLastNode}
                disabled={nodes.length === 0}
                className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Borrar ultimo
              </button>

              <button
                type="button"
                onClick={() => setSelectedNodeIds([])}
                disabled={selectedNodeIds.length === 0}
                className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Limpiar seleccion
              </button>
            </div>

            <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
              {nodes.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Activa Agregar nodos y haz clic sobre el mapa.
                </p>
              ) : (
                nodes.map((node, index) => (
                  <label key={node.id} className="block text-xs text-slate-300">
                    {index + 1}. Nombre
                    <input
                      type="text"
                      value={node.name}
                      onChange={(event) => updateNodeName(node.id, event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs outline-none focus:border-red-500"
                    />
                  </label>
                ))
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
              <span>Nodos: {nodes.length}</span>
              <span>Conexiones: {edges.length}</span>
              <span>Sel: {selectedNodeIds.length}/2</span>
            </div>

            <textarea
              readOnly
              value={exportCode}
              className="h-40 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-3 font-mono text-[11px] text-slate-300 outline-none"
            />
          </div>
        )}
      </div>
    </>
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
