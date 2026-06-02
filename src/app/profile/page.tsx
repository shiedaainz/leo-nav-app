"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  CalendarDays,
  GitBranch,
  Heart,
  LogOut,
  MapPinned,
  ShieldCheck,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { campusLocations, type CampusLocation } from "@/data/campusLocations";
import {
  getFavoriteLocationIds,
  removeFavoriteLocation,
} from "@/utils/favorites";
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
  const [favoriteLocationIds, setFavoriteLocationIds] = useState<string[]>([]);
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
          setFavoriteLocationIds(favoriteIds);
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

  const favoriteLocations = useMemo(
    () =>
      favoriteLocationIds
        .map((locationId) =>
          campusLocations.find((location) => location.id === locationId),
        )
        .filter((location): location is CampusLocation => Boolean(location)),
    [favoriteLocationIds],
  );

  const handleRemoveFavorite = async (locationId: string) => {
    setFavoriteLocationIds((currentIds) =>
      currentIds.filter((favoriteId) => favoriteId !== locationId),
    );
    await removeFavoriteLocation(locationId);
  };

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
    <main className="min-h-screen bg-[var(--up-blue-dark)] px-4 py-6 text-white sm:px-5 sm:py-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-[var(--up-gray)]/80">Perfil de usuario</p>
            <h1 className="truncate text-2xl font-bold sm:text-3xl">{sessionUser.name}</h1>
          </div>

          <Link
            href="/home"
            className="flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20"
          >
            Volver al mapa
          </Link>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[var(--up-blue)]/90 p-5 shadow-2xl sm:p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[var(--up-red)] p-4">
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
          <article className="rounded-2xl border border-white/10 bg-[var(--up-blue)]/80 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-white/10 p-3">
                <Heart size={24} />
              </div>
              <span className="text-3xl font-bold">
                {isLoadingStats ? "--" : favoriteLocationIds.length}
              </span>
            </div>
            <h3 className="font-bold">Favoritos</h3>
            <p className="mt-1 text-sm text-[var(--up-gray)]/80">
              Destinos marcados para encontrarlos mas rapido.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[var(--up-blue)]/80 p-5 shadow-2xl">
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

        <section className="rounded-2xl border border-white/10 bg-[var(--up-blue)]/80 p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Mis favoritos</h2>
              <p className="text-sm text-[var(--up-gray)]/80">
                Accesos rapidos a tus destinos mas usados.
              </p>
            </div>
            <Star className="fill-yellow-300 text-yellow-300" size={24} />
          </div>

          {isLoadingStats ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-[var(--up-gray)]/80">
              Cargando favoritos...
            </div>
          ) : favoriteLocations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-[var(--up-gray)]/80">
              Aun no tienes destinos favoritos. Marca una sede con la estrella desde el mapa.
            </div>
          ) : (
            <div className="grid gap-3">
              {favoriteLocations.map((location) => (
                <article
                  key={location.id}
                  className="rounded-xl border border-white/10 bg-white/10 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold">{location.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--up-gray)]/80">
                        {location.description}
                      </p>
                    </div>
                    <span
                      className="mt-1 h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: location.color }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Link
                      href={`/home?destination=${location.id}`}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--up-red)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--up-red-dark)]"
                    >
                      <MapPinned size={18} />
                      Ir
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleRemoveFavorite(location.id)}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
                    >
                      <Trash2 size={18} />
                      Quitar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/home"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--up-red)] px-4 py-3 font-semibold transition hover:bg-[var(--up-red-dark)]"
          >
            <MapPinned size={20} />
            Mapa
          </Link>
          <Link
            href="/schedule"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-semibold transition hover:bg-white/20"
          >
            <CalendarDays size={20} />
            Horarios
          </Link>
          <Link
            href="/admin/graph"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-semibold transition hover:bg-white/20"
          >
            <GitBranch size={20} />
            Grafo
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-semibold transition hover:bg-white/20"
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
