"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SplashPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--up-blue-dark)] px-5 py-8 text-white">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative h-60 w-48 drop-shadow-2xl"
        >
          <Image
            src="/leo-logo.png"
            alt="Leo"
            fill
            priority
            sizes="192px"
            className="object-contain"
          />
        </motion.div>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--up-gray)]/80">
            Universidad de Pamplona
          </p>
          <h1 className="text-5xl font-bold">Leo</h1>
          <p className="mx-auto max-w-xs text-sm text-[var(--up-gray)]">
            Asistente de navegacion para sedes, rutas y horarios academicos.
          </p>
        </div>

        <Link
          href="/login"
          className="w-full rounded-2xl bg-[var(--up-red)] px-8 py-3 font-semibold transition hover:bg-[var(--up-red-dark)]"
        >
          Comenzar
        </Link>

        <p className="text-xs text-[var(--up-gray)]/70">
          Colores institucionales y rutas base del campus.
        </p>
      </div>
    </main>
  );
}
