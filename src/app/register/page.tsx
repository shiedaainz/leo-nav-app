"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { registerUser } from "@/utils/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError("Completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    const result = await registerUser({ name, email, password });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push("/login?registered=true");
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

          <h1 className="text-3xl font-bold">Crear cuenta</h1>
          <p className="mt-2 text-sm text-[var(--up-gray)]/80">
            Crea tu usuario para guardar rutas y horarios del campus.
          </p>
        </div>

        <form className="space-y-5 px-8 py-7" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-[var(--up-gray)]">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
              className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 outline-none transition focus:border-[var(--up-red)]"
            />
          </div>

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
            <label className="mb-2 block text-sm text-[var(--up-gray)]">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimo 6 caracteres"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 outline-none transition focus:border-[var(--up-red)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--up-gray)]">
              Confirmar contrasena
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repite tu contrasena"
              autoComplete="new-password"
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
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
          <div className="text-center text-sm text-[var(--up-gray)]/80">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[var(--up-gray)] hover:text-white">
            Iniciar sesion
          </Link>
          </div>
        </form>
      </motion.div>
    </main>
  );
}



