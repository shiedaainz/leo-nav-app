import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getSession, isVisitorSession } from "@/utils/auth";

export interface ClassSchedule {
  id: string;
  subject: string;
  locationId: string;
  classroom: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface ScheduleRow {
  id: string;
  subject: string;
  location_id: string;
  classroom: string;
  day: string;
  start_time: string;
  end_time: string;
}

const SCHEDULES_KEY = "leo.schedules";

export function getLocalSchedules() {
  if (typeof window === "undefined") {
    return [] as ClassSchedule[];
  }

  const rawSchedules = window.localStorage.getItem(SCHEDULES_KEY);

  if (!rawSchedules) {
    return [] as ClassSchedule[];
  }

  try {
    return JSON.parse(rawSchedules) as ClassSchedule[];
  } catch {
    return [] as ClassSchedule[];
  }
}

export async function getSchedules() {
  const session = getSession();

  if (!isSupabaseConfigured || !supabase || isVisitorSession(session)) {
    return getLocalSchedules();
  }

  const { data, error } = await supabase
    .from("schedules")
    .select("id, subject, location_id, classroom, day, start_time, end_time")
    .order("day", { ascending: true })
    .order("start_time", { ascending: true });

  if (error || !data) {
    return getLocalSchedules();
  }

  return data.map(fromScheduleRow);
}

export async function saveSchedule(schedule: Omit<ClassSchedule, "id">) {
  const session = getSession();

  if (!isSupabaseConfigured || !supabase || isVisitorSession(session)) {
    return saveLocalSchedule(schedule);
  }

  const { data, error } = await supabase
    .from("schedules")
    .insert({
      user_id: session!.id,
      subject: schedule.subject,
      location_id: schedule.locationId,
      classroom: schedule.classroom,
      day: schedule.day,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
    })
    .select("id, subject, location_id, classroom, day, start_time, end_time")
    .single();

  if (error || !data) {
    return saveLocalSchedule(schedule);
  }

  return fromScheduleRow(data);
}

export async function deleteSchedule(scheduleId: string) {
  const session = getSession();

  if (!isSupabaseConfigured || !supabase || isVisitorSession(session)) {
    deleteLocalSchedule(scheduleId);
    return;
  }

  const { error } = await supabase.from("schedules").delete().eq("id", scheduleId);

  if (error) {
    deleteLocalSchedule(scheduleId);
  }
}

function saveLocalSchedule(schedule: Omit<ClassSchedule, "id">) {
  const schedules = getLocalSchedules();
  const newSchedule: ClassSchedule = {
    ...schedule,
    id: crypto.randomUUID(),
  };

  window.localStorage.setItem(
    SCHEDULES_KEY,
    JSON.stringify([...schedules, newSchedule]),
  );

  return newSchedule;
}

function deleteLocalSchedule(scheduleId: string) {
  const schedules = getLocalSchedules().filter((schedule) => schedule.id !== scheduleId);
  window.localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

function fromScheduleRow(row: ScheduleRow): ClassSchedule {
  return {
    id: row.id,
    subject: row.subject,
    locationId: row.location_id,
    classroom: row.classroom,
    day: row.day,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
  };
}
