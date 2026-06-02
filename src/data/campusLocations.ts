import { campusNodes, locationNodeById as baseLocationNodeById } from "@/data/campusGraph";

export type CampusLocationType = "building" | "classroom" | "service" | "library";

export interface CampusLocation {
  id: string;
  name: string;
  type: CampusLocationType;
  description: string;
  lat: number;
  lng: number;
  color: string;
  estimatedMinutes: number;
}

const mainCampusLocations: CampusLocation[] = [
  {
    id: "biblioteca",
    name: "Biblioteca",
    type: "library",
    description: "Zona de estudio, consulta bibliografica y apoyo academico.",
    lat: 7.386383,
    lng: -72.648996,
    color: "#003366",
    estimatedMinutes: 4,
  },
  {
    id: "casona",
    name: "Sede Casona",
    type: "building",
    description: "Sede institucional ubicada en el sector historico de Pamplona.",
    lat: 7.378181,
    lng: -72.649115,
    color: "#ad3333",
    estimatedMinutes: 8,
  },
  {
    id: "ipt",
    name: "IPT",
    type: "building",
    description: "Sede academica asociada a programas de tecnologia e ingenieria.",
    lat: 7.377962,
    lng: -72.646665,
    color: "#ad3333",
    estimatedMinutes: 7,
  },
  {
    id: "virgen-del-rosario",
    name: "Sede Virgen del Rosario",
    type: "building",
    description: "Sede academica de referencia para clases y servicios universitarios.",
    lat: 7.378579,
    lng: -72.647534,
    color: "#003366",
    estimatedMinutes: 6,
  },
  {
    id: "club-del-comercio",
    name: "Sede Club del Comercio",
    type: "building",
    description: "Sede universitaria ubicada en el sector Club del Comercio.",
    lat: 7.377196,
    lng: -72.647117,
    color: "#8a8a8a",
    estimatedMinutes: 8,
  },
  {
    id: "entrada-principal",
    name: "Entrada principal",
    type: "service",
    description: "Punto de ingreso principal y referencia para iniciar recorridos.",
    lat: 7.383545,
    lng: -72.648346,
    color: "#ad3333",
    estimatedMinutes: 1,
  },
  {
    id: "plaza-central",
    name: "Plaza central",
    type: "service",
    description: "Espacio central de encuentro y referencia dentro del campus.",
    lat: 7.387197,
    lng: -72.649713,
    color: "#dadada",
    estimatedMinutes: 5,
  },
];

const mainLocationNodeIds = new Set(Object.values(baseLocationNodeById));

const graphNodeLocations: CampusLocation[] = campusNodes
  .filter((node) => !isGenericNodeName(node.name))
  .filter((node) => !mainLocationNodeIds.has(node.id))
  .map((node) => {
    const type = getGraphNodeLocationType(node.name);

    return {
      id: `grafo-${node.id}`,
      name: node.name,
      type,
      description: `Punto de referencia del campus: ${node.name}.`,
      lat: node.lat,
      lng: node.lng,
      color: type === "building" ? "#ad3333" : "#003366",
      estimatedMinutes: 5,
    };
  });

export const campusLocations: CampusLocation[] = [
  ...mainCampusLocations,
  ...graphNodeLocations,
];

export const destinationNodeById: Record<string, string> = {
  ...baseLocationNodeById,
  ...Object.fromEntries(
    graphNodeLocations.map((location) => [
      location.id,
      location.id.replace("grafo-", ""),
    ]),
  ),
};

function isGenericNodeName(name: string) {
  return /^Nodo \d+$/i.test(name.trim());
}

function getGraphNodeLocationType(name: string): CampusLocationType {
  const normalizedName = name.toLowerCase();

  if (
    normalizedName.includes("edificio") ||
    normalizedName.includes("bloque") ||
    normalizedName.includes("laboratorio") ||
    normalizedName.includes("teatro") ||
    normalizedName.includes("gimnasio")
  ) {
    return "building";
  }

  return "service";
}


