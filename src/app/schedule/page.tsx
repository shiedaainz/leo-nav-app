"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPinned, Pencil, Plus, Trash2, X } from "lucide-react";
import { campusLocations } from "@/data/campusLocations";
import {
  deleteSchedule,
  getSchedules,
  saveSchedule,
  updateSchedule,
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

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [subject, setSubject] = useState("");
  const [locationId, setLocationId] = useState(campusLocations[0]?.id ?? "");
  const [classroom, setClassroom] = useState("");
  const [day, setDay] = useState(days[0]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getSchedules()
      .then((loadedSchedules) => {
        if (isMounted) {
          setSchedules(loadedSchedules);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const locationById = useMemo(
    () => new Map(campusLocations.map((location) => [location.id, location])),
    [],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!subject.trim() || !locationId || !classroom.trim()) {
      setError("Completa materia, sede y aula o referencia.");
      return;
    }

    setIsSaving(true);
    const schedulePayload = {
      subject: subject.trim(),
      locationId,
      classroom: classroom.trim(),
      day,
      startTime,
      endTime,
    };

    const savedSchedule = editingScheduleId
      ? await updateSchedule(editingScheduleId, schedulePayload)
      : await saveSchedule(schedulePayload);
    setIsSaving(false);

    setSchedules((currentSchedules) =>
      editingScheduleId
        ? currentSchedules.map((schedule) =>
            schedule.id === editingScheduleId ? savedSchedule : schedule,
          )
        : [...currentSchedules, savedSchedule],
    );
    clearForm();
  };

  const handleDelete = async (scheduleId: string) => {
    await deleteSchedule(scheduleId);
    setSchedules((currentSchedules) =>
      currentSchedules.filter((schedule) => schedule.id !== scheduleId),
    );
  };

  const handleEdit = (schedule: ClassSchedule) => {
    setEditingScheduleId(schedule.id);
    setSubject(schedule.subject);
    setLocationId(schedule.locationId);
    setClassroom(schedule.classroom);
    setDay(schedule.day);
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setError(null);
  };

  const clearForm = () => {
    setEditingScheduleId(null);
    setSubject("");
    setLocationId(campusLocations[0]?.id ?? "");
    setClassroom("");
    setDay(days[0]);
    setStartTime("08:00");
    setEndTime("10:00");
  };

  return (
    <main className="min-h-screen bg-[var(--up-blue-dark)] px-4 py-6 text-white sm:px-5 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[var(--up-gray)]/80">Modulo opcional</p>
            <h1 className="text-2xl font-bold sm:text-3xl">Horarios</h1>
          </div>

          <Link
            href="/home"
            className="flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20"
          >
            Volver al mapa
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-[var(--up-blue)]/90 p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-[var(--up-red)] p-3">
                <Plus size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingScheduleId ? "Editar clase" : "Nueva clase"}
                </h2>
                <p className="text-sm text-[var(--up-gray)]/80">
                  {editingScheduleId
                    ? "Actualiza los datos de tu horario."
                    : "Guardala para acceder rapido a su ruta."}
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
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
                />
              </label>

              <label className="block text-sm text-[var(--up-gray)]">
                Sede o destino
                <select
                  value={locationId}
                  onChange={(event) => setLocationId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
                >
                  {campusLocations.map((location) => (
                    <option key={location.id} value={location.id} className="text-slate-950">
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-[var(--up-gray)]">
                Aula o referencia
                <input
                  value={classroom}
                  onChange={(event) => setClassroom(event.target.value)}
                  placeholder="Aula o referencia"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block text-sm text-[var(--up-gray)]">
                  Dia
                  <select
                    value={day}
                    onChange={(event) => setDay(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
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
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
                  />
                </label>

                <label className="block text-sm text-[var(--up-gray)]">
                  Fin
                  <input
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
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
                disabled={isSaving}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--up-red)] py-3 font-semibold transition hover:bg-[var(--up-red-dark)] disabled:cursor-wait disabled:opacity-70"
              >
                <CalendarDays size={20} />
                {isSaving
                  ? editingScheduleId
                    ? "Actualizando..."
                    : "Guardando..."
                  : editingScheduleId
                    ? "Actualizar clase"
                    : "Guardar clase"}
              </button>

              {editingScheduleId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 py-3 font-semibold transition hover:bg-white/20"
                >
                  <X size={20} />
                  Cancelar edicion
                </button>
              )}
            </div>
          </form>

          <section className="rounded-2xl border border-white/10 bg-[var(--up-blue)]/80 p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Mis clases</h2>
                <p className="text-sm text-[var(--up-gray)]/80">
                  Este modulo es opcional. Puedes usar Leo sin horarios.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-[var(--up-gray)]/80">
                Cargando horarios...
              </div>
            ) : schedules.length === 0 ? (
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
                      className="rounded-xl border border-white/10 bg-white/10 p-4"
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

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(schedule)}
                            className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
                            aria-label="Editar clase"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(schedule.id)}
                            className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
                            aria-label="Eliminar clase"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <Link
                        href={`/home?destination=${schedule.locationId}`}
                        className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--up-red)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--up-red-dark)]"
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
