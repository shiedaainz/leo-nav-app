"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { CalendarDays, Heart, LogOut, MapPinned, ShieldCheck, User } from "lucide-react";
import { getFavoriteLocationIds } from "@/utils/favorites";
import { getSchedules } from "@/utils/schedules";
import { isVisitorSession, logout, type SessionUser } from "@/utils/auth";

export default function ProfilePage() {
  const router = useRouter();
  const sessionSnapshot = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const sessionUser = useMemo(() => parseSession(sessionSnapshot), [sessionSnapshot]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [scheduleCount, setScheduleCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (sessionSnapshot === null) {
      router.replace("/login");
    }
  }, [router, sessionSnapshot]);

  useEffect(() => {
    if (!sessionUser) {
      return;
    }

    let isMounted = true;

    Promise.all([getFavoriteLocationIds(), getSchedules()])
      .then(([favoriteIds, schedules]) => {
        if (isMounted) {
          setFavoriteCount(favoriteIds.length);
          setScheduleCount(schedules.length);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingStats(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [sessionUser]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!sessionUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--up-blue-dark)] text-sm text-[var(--up-gray)]/80">
        Cargando perfil...
      </main>
    );
  }

  const isVisitor = isVisitorSession(sessionUser);

  return (
    <main className="min-h-screen bg-[var(--up-blue-dark)] px-5 py-8 text-white">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--up-gray)]/80">Perfil de usuario</p>
            <h1 className="text-3xl font-bold">{sessionUser.name}</h1>
          </div>

          <Link
            href="/home"
            className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20"
          >
            Volver al mapa
          </Link>
        </header>

        <section className="rounded-3xl border border-white/10 bg-[var(--up-blue)]/90 p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="rounded-3xl bg-[var(--up-red)] p-4">
              <User size={34} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold">{sessionUser.name}</h2>
              <p className="mt-1 break-all text-sm text-[var(--up-gray)]/80">
                {sessionUser.email}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-[var(--up-gray)]">
                <ShieldCheck size={14} />
                {isVisitor ? "Modo visitante" : "Cuenta registrada"}
              </div>
            </div>
          </div>

          {isVisitor && (
            <p className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              Estas usando Leo como visitante. Tus favoritos y horarios se guardan solo en este navegador.
            </p>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-[var(--up-blue)]/80 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-white/10 p-3">
                <Heart size={24} />
              </div>
              <span className="text-3xl font-bold">
                {isLoadingStats ? "--" : favoriteCount}
              </span>
            </div>
            <h3 className="font-bold">Favoritos</h3>
            <p className="mt-1 text-sm text-[var(--up-gray)]/80">
              Destinos marcados para encontrarlos mas rapido.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[var(--up-blue)]/80 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-white/10 p-3">
                <CalendarDays size={24} />
              </div>
              <span className="text-3xl font-bold">
                {isLoadingStats ? "--" : scheduleCount}
              </span>
            </div>
            <h3 className="font-bold">Horarios</h3>
            <p className="mt-1 text-sm text-[var(--up-gray)]/80">
              Clases o actividades guardadas para navegar rapido.
            </p>
          </article>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/home"
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--up-red)] px-4 py-3 font-semibold transition hover:bg-[var(--up-red-dark)]"
          >
            <MapPinned size={20} />
            Mapa
          </Link>
          <Link
            href="/schedule"
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 font-semibold transition hover:bg-white/20"
          >
            <CalendarDays size={20} />
            Horarios
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 font-semibold transition hover:bg-white/20"
          >
            <LogOut size={20} />
            Cerrar sesion
          </button>
        </section>
      </section>
    </main>
  );
}

function subscribeToSession(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSessionSnapshot() {
  return window.localStorage.getItem("leo.session");
}

function getServerSessionSnapshot() {
  return null;
}

function parseSession(snapshot: string | null) {
  if (!snapshot) {
    return null;
  }

  try {
    return JSON.parse(snapshot) as SessionUser;
  } catch {
    return null;
  }
}
