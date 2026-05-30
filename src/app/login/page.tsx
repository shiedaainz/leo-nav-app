"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { loginAsVisitor, loginUser } from "@/utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const registeredSnapshot = useSyncExternalStore(
    subscribeToUrl,
    getRegisteredSnapshot,
    getServerRegisteredSnapshot,
  );
  const showRegisteredMessage = useMemo(
    () => registeredSnapshot === "true",
    [registeredSnapshot],
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Ingresa correo y contrasena.");
      return;
    }

    setIsSubmitting(true);
    const result = await loginUser({ email, password });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push("/home");
  };

  const handleVisitorLogin = () => {
    loginAsVisitor();
    router.push("/home");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--up-blue-dark)] px-5 py-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[var(--up-blue)]/95 shadow-2xl backdrop-blur"
      >
        <div className="border-b border-white/10 bg-white/[0.04] px-8 py-7 text-center">
          <div className="relative mx-auto mb-4 h-28 w-24 drop-shadow-xl">
            <Image
              src="/leo-logo.png"
              alt="Leo"
              fill
              priority
              sizes="96px"
              className="object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold">Bienvenido</h1>
          <p className="mt-2 text-sm text-[var(--up-gray)]/80">
            Inicia sesion para navegar por la Universidad de Pamplona.
          </p>
        </div>

        <form className="space-y-5 px-8 py-7" onSubmit={handleSubmit}>
          {showRegisteredMessage && (
            <p className="rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
              Cuenta creada. Si Supabase pide confirmacion, revisa tu correo antes de iniciar sesion.
            </p>
          )}

          <div>
            <label className="mb-2 block text-sm text-[var(--up-gray)]">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@universidad.edu"
              autoComplete="email"
              className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 outline-none transition focus:border-[var(--up-red)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--up-gray)]">
              Contrasena
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 outline-none transition focus:border-[var(--up-red)]"
            />
          </div>

          {error && (
            <p className="rounded-2xl border border-[var(--up-red)]/40 bg-[var(--up-red)]/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[var(--up-red)] py-3 font-semibold transition hover:bg-[var(--up-red-dark)] disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>

          <button
            type="button"
            onClick={handleVisitorLogin}
            className="w-full rounded-2xl border border-white/15 py-3 font-semibold transition hover:bg-white/10"
          >
            Entrar como visitante
          </button>
          <div className="text-center text-sm text-[var(--up-gray)]/80">
          No tienes cuenta?{" "}
          <Link href="/register" className="text-[var(--up-gray)] hover:text-white">
            Crear cuenta
          </Link>
          </div>
        </form>
      </motion.div>
    </main>
  );
}

function subscribeToUrl(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);

  return () => {
    window.removeEventListener("popstate", onStoreChange);
  };
}

function getRegisteredSnapshot() {
  return new URLSearchParams(window.location.search).get("registered");
}

function getServerRegisteredSnapshot() {
  return null;
}



