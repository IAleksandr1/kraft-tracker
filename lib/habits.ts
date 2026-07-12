export type Habit = { id: string; name: string };
export type Completions = Record<string, string[]>; // habitId -> массив ISO-дат

const HABITS_KEY = "kraft-tracker:habits";
const COMPLETIONS_KEY = "kraft-tracker:completions";

export function getHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HABITS_KEY);
    return raw ? (JSON.parse(raw) as Habit[]) : [];
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function getCompletions(): Completions {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(COMPLETIONS_KEY);
    return raw ? (JSON.parse(raw) as Completions) : {};
  } catch {
    return {};
  }
}

export function saveCompletions(completions: Completions) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}

export function addHabit(name: string): Habit[] {
  const trimmed = name.trim();
  if (!trimmed) return getHabits();
  const habits = getHabits();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const updated = [...habits, { id, name: trimmed }];
  saveHabits(updated);
  return updated;
}

export function removeHabit(id: string): Habit[] {
  const updated = getHabits().filter((h) => h.id !== id);
  saveHabits(updated);
  const completions = getCompletions();
  delete completions[id];
  saveCompletions(completions);
  return updated;
}

export function toggleCompletion(habitId: string, isoDate: string): Completions {
  const completions = getCompletions();
  const dates = completions[habitId] || [];
  const has = dates.includes(isoDate);
  const updatedDates = has
    ? dates.filter((d) => d !== isoDate)
    : [...dates, isoDate];
  const updated = { ...completions, [habitId]: updatedDates };
  saveCompletions(updated);
  return updated;
}

export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getStreak(habitId: string, completions: Completions): number {
  const done = new Set(completions[habitId] || []);
  let streak = 0;
  const cursor = new Date();
  // если сегодня ещё не отмечено, серия считается по вчерашнему дню и раньше
  if (!done.has(toLocalISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (done.has(toLocalISODate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
