export interface ClassSchedule {
  id: string;
  subject: string;
  locationId: string;
  classroom: string;
  day: string;
  startTime: string;
  endTime: string;
}

const SCHEDULES_KEY = "leo.schedules";

export function getSchedules() {
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

export function saveSchedule(schedule: Omit<ClassSchedule, "id">) {
  const schedules = getSchedules();
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

export function deleteSchedule(scheduleId: string) {
  const schedules = getSchedules().filter((schedule) => schedule.id !== scheduleId);
  window.localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}
