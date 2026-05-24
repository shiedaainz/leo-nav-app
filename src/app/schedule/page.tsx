"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { CalendarDays, MapPinned, Plus, Trash2 } from "lucide-react";
import { campusLocations } from "@/data/campusLocations";
import {
  deleteSchedule,
  saveSchedule,
  type ClassSchedule,
} from "@/utils/schedules";

const days = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

const schedulesKey = "leo.schedules";
const schedulesEvent = "leo-schedules-change";

export default function SchedulePage() {
  const schedulesSnapshot = useSyncExternalStore(
    subscribeToSchedules,
    getSchedulesSnapshot,
    getServerSchedulesSnapshot,
  );
  const schedules = useMemo(
    () => parseSchedules(schedulesSnapshot),
    [schedulesSnapshot],
  );
  const [subject, setSubject] = useState("");
  const [locationId, setLocationId] = useState(campusLocations[0]?.id ?? "");
  const [classroom, setClassroom] = useState("");
  const [day, setDay] = useState(days[0]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [error, setError] = useState<string | null>(null);

  const locationById = useMemo(
    () => new Map(campusLocations.map((location) => [location.id, location])),
    [],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!subject.trim() || !locationId || !classroom.trim()) {
      setError("Completa materia, sede y salon.");
      return;
    }

    saveSchedule({
      subject: subject.trim(),
      locationId,
      classroom: classroom.trim(),
      day,
      startTime,
      endTime,
    });

    notifySchedulesChange();
    setSubject("");
    setClassroom("");
  };

  const handleDelete = (scheduleId: string) => {
    deleteSchedule(scheduleId);
    notifySchedulesChange();
  };

  return (
    <main className="min-h-screen bg-[var(--up-blue-dark)] px-5 py-8 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--up-gray)]/80">Modulo opcional</p>
            <h1 className="text-3xl font-bold">Horarios</h1>
          </div>

          <Link
            href="/home"
            className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20"
          >
            Volver al mapa
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-[var(--up-blue)]/90 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--up-red)] p-3">
                <Plus size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Nueva clase</h2>
                <p className="text-sm text-[var(--up-gray)]/80">
                  Guardala para acceder rapido a su ruta.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm text-[var(--up-gray)]">
                Materia
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Programacion"
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
                />
              </label>

              <label className="block text-sm text-[var(--up-gray)]">
                Sede o destino
                <select
                  value={locationId}
                  onChange={(event) => setLocationId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
                >
                  {campusLocations.map((location) => (
                    <option key={location.id} value={location.id} className="text-slate-950">
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-[var(--up-gray)]">
                Salon
                <input
                  value={classroom}
                  onChange={(event) => setClassroom(event.target.value)}
                  placeholder="Aula o referencia"
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block text-sm text-[var(--up-gray)]">
                  Dia
                  <select
                    value={day}
                    onChange={(event) => setDay(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
                  >
                    {days.map((dayOption) => (
                      <option key={dayOption} value={dayOption} className="text-slate-950">
                        {dayOption}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm text-[var(--up-gray)]">
                  Inicio
                  <input
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
                  />
                </label>

                <label className="block text-sm text-[var(--up-gray)]">
                  Fin
                  <input
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
                  />
                </label>
              </div>

              {error && (
                <p className="rounded-2xl border border-[var(--up-red)]/40 bg-[var(--up-red)]/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--up-red)] py-3 font-semibold transition hover:bg-[var(--up-red-dark)]"
              >
                <CalendarDays size={20} />
                Guardar clase
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-white/10 bg-[var(--up-blue)]/80 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Mis clases</h2>
                <p className="text-sm text-[var(--up-gray)]/80">
                  Este modulo es opcional. Puedes usar Leo sin horarios.
                </p>
              </div>
            </div>

            {schedules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-[var(--up-gray)]/80">
                Aun no tienes clases guardadas.
              </div>
            ) : (
              <div className="grid gap-4">
                {schedules.map((schedule) => {
                  const selectedCampusLocation = locationById.get(schedule.locationId);

                  return (
                    <article
                      key={schedule.id}
                      className="rounded-2xl border border-white/10 bg-white/10 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold">{schedule.subject}</h3>
                          <p className="text-sm text-[var(--up-gray)]/80">
                            {selectedCampusLocation?.name ?? "Destino"} - {schedule.classroom}
                          </p>
                          <p className="mt-1 text-xs text-[var(--up-gray)]/70">
                            {schedule.day}, {schedule.startTime} - {schedule.endTime}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(schedule.id)}
                          className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
                          aria-label="Eliminar clase"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <Link
                        href={`/home?destination=${schedule.locationId}`}
                        className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[var(--up-red)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--up-red-dark)]"
                      >
                        <MapPinned size={18} />
                        Ir
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function subscribeToSchedules(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(schedulesEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(schedulesEvent, onStoreChange);
  };
}

function getSchedulesSnapshot() {
  return window.localStorage.getItem(schedulesKey) ?? "[]";
}

function getServerSchedulesSnapshot() {
  return "[]";
}

function parseSchedules(snapshot: string) {
  try {
    return JSON.parse(snapshot) as ClassSchedule[];
  } catch {
    return [] as ClassSchedule[];
  }
}

function notifySchedulesChange() {
  window.dispatchEvent(new Event(schedulesEvent));
}
