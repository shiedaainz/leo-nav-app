"use client";

import { CircleMarker, Polyline, Popup } from "react-leaflet";
import { campusEdges, type CampusNode } from "@/data/campusGraph";
import RecenterMap from "@/app/components/map/RecenterMap";

interface GraphAdminMapProps {
  nodes: CampusNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export default function GraphAdminMap({
  nodes,
  selectedNodeId,
  onSelectNode,
}: GraphAdminMapProps) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const selectedNode = selectedNodeId ? nodeById.get(selectedNodeId) : null;

  return (
    <>
      {campusEdges.map((edge) => {
        const fromNode = nodeById.get(edge.from);
        const toNode = nodeById.get(edge.to);

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
            pathOptions={{ color: "#ffffff", weight: 2, opacity: 0.35 }}
          />
        );
      })}

      {nodes.map((node) => {
        const isSelected = node.id === selectedNodeId;
        const isNamed = !/^Nodo \d+$/i.test(node.name.trim());

        return (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={isSelected ? 10 : isNamed ? 7 : 5}
            pathOptions={{
              color: isSelected ? "#ffffff" : isNamed ? "#facc15" : "#ffffff",
              fillColor: isSelected ? "#ad3333" : isNamed ? "#facc15" : "#003366",
              fillOpacity: isNamed || isSelected ? 0.95 : 0.65,
              weight: isSelected ? 4 : 2,
            }}
            eventHandlers={{
              click() {
                onSelectNode(node.id);
              },
            }}
          >
            <Popup>
              <strong>{node.name}</strong>
              <br />
              {node.id}
              <br />
              {node.lat.toFixed(6)}, {node.lng.toFixed(6)}
            </Popup>
          </CircleMarker>
        );
      })}

      {selectedNode && (
        <RecenterMap lat={selectedNode.lat} lng={selectedNode.lng} zoom={18} />
      )}
    </>
  );
}
