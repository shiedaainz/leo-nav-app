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

export const campusLocations: CampusLocation[] = [
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

