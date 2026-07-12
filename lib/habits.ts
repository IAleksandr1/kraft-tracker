export type Habit = { id: string; name: string };
export type Completions = Record<string, string[]>; // habitId -> массив ISO-дат

export type HabitEvent = {
  timestamp: string;
  action: "add_habit" | "remove_habit" | "done" | "undone";
  habitId: string;
  habitName: string;
  date: string;
};

/**
 * Собирает журнал событий (append-only лог из Google Таблицы) в текущее
 * состояние: список привычек и отметки по дням. Порядок строк в таблице —
 * это порядок событий во времени, поэтому просто проходим по ним по очереди.
 */
export function processHabitEvents(events: HabitEvent[]): {
  habits: Habit[];
  completions: Completions;
} {
  const habitsMap = new Map<string, string>();
  const completions: Completions = {};

  for (const e of events) {
    switch (e.action) {
      case "add_habit":
        habitsMap.set(e.habitId, e.habitName);
        break;
      case "remove_habit":
        habitsMap.delete(e.habitId);
        delete completions[e.habitId];
        break;
      case "done": {
        const dates = completions[e.habitId] || [];
        if (!dates.includes(e.date)) dates.push(e.date);
        completions[e.habitId] = dates;
        break;
      }
      case "undone": {
        const dates = completions[e.habitId] || [];
        completions[e.habitId] = dates.filter((d) => d !== e.date);
        break;
      }
    }
  }

  const habits: Habit[] = Array.from(habitsMap.entries()).map(([id, name]) => ({
    id,
    name,
  }));

  return { habits, completions };
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

export function newHabitId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
