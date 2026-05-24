import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Leo - Navegacion Universitaria",
    short_name: "Leo",
    description: "Asistente de navegacion para sedes, rutas y horarios academicos de la Universidad de Pamplona.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#001f3f",
    theme_color: "#ad3333",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["education", "navigation", "productivity"],
  };
}
