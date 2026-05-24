import type { Metadata, Viewport } from "next";
import PwaRegistration from "./components/PwaRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Leo - Navegacion Universitaria",
    template: "%s | Leo",
  },
  description:
    "Asistente de navegacion para sedes, rutas y horarios academicos de la Universidad de Pamplona.",
  applicationName: "Leo",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Leo",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ad3333",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}

