"use client";

import { useEffect, useState } from "react";
import {
  Habit,
  Completions,
  getHabits,
  getCompletions,
  addHabit,
  removeHabit,
  toggleCompletion,
  getStreak,
  toLocalISODate,
} from "@/lib/habits";

const DAYS_SHOWN = 14;

type Day = { iso: string; weekday: string; dayNum: number; isToday: boolean };

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completions>({});
  const [newHabit, setNewHabit] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHabits(getHabits());
    setCompletions(getCompletions());
    setMounted(true);
  }, []);

  const days = lastDays(DAYS_SHOWN);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setHabits(addHabit(newHabit));
    setNewHabit("");
  }

  function handleToggle(habitId: string, iso: string) {
    setCompletions(toggleCompletion(habitId, iso));
  }

  function handleRemove(id: string) {
    setHabits(removeHabit(id));
    setCompletions(getCompletions());
  }

  if (!mounted) {
    return (
      <div className="bg-paper border-2 border-ink p-6">
        <p className="font-mono text-sm text-graphite">Загружаю…</p>
      </div>
    );
  }

  return (
    <div className="bg-paper border-2 border-ink p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h2 className="font-display text-lg tracking-tight">ПРИВЫЧКИ</h2>
        <span className="stamp">хранится только в браузере</span>
      </div>
      <p className="font-mono text-xs text-graphite mb-5 max-w-2xl">
        Отметь квадратик за нужный день. Эти данные никуда не отправляются —
        живут прямо на этом сайте, в отличие от бухгалтерии.
      </p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6 max-w-md">
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Новая привычка, например «зарядка»"
          className="flex-1 bg-transparent border border-line focus:border-ink outline-none p-2 font-mono text-sm"
        />
        <button
          type="submit"
          className="border-2 border-ink px-4 font-display text-xs hover:bg-ink hover:text-paper transition-colors shrink-0"
        >
          + ДОБАВИТЬ
        </button>
      </form>

      {habits.length === 0 ? (
        <p className="font-mono text-sm text-graphite">
          Пока нет ни одной привычки — добавь первую выше.
        </p>
      ) : (
        <>
          <p className="font-mono text-[11px] text-graphite/70 mb-2 sm:hidden">
            ← таблицу можно прокрутить в сторону →
          </p>
          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="border-collapse min-w-full">
            <thead>
              <tr>
                <th className="text-left font-mono text-xs text-graphite font-normal pb-2 pr-3 sticky left-0 bg-paper">
                  привычка
                </th>
                {days.map((d) => (
                  <th
                    key={d.iso}
                    className={`font-mono text-[10px] font-normal pb-2 px-1 text-center ${
                      d.isToday ? "text-ink" : "text-graphite"
                    }`}
                  >
                    <div>{d.weekday}</div>
                    <div>{d.dayNum}</div>
                  </th>
                ))}
                <th className="font-mono text-xs text-graphite font-normal pb-2 pl-3 text-center whitespace-nowrap">
                  серия
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => {
                const streak = getStreak(habit.id, completions);
                const done = new Set(completions[habit.id] || []);
                return (
                  <tr key={habit.id} className="ledger-row">
                    <td className="font-mono text-sm py-2 pr-3 sticky left-0 bg-paper whitespace-nowrap">
                      {habit.name}
                    </td>
                    {days.map((d) => {
                      const isDone = done.has(d.iso);
                      return (
                        <td key={d.iso} className="text-center py-2 px-1">
                          <button
                            type="button"
                            onClick={() => handleToggle(habit.id, d.iso)}
                            aria-label={`${habit.name}: ${d.iso}${
                              isDone ? " (отмечено)" : ""
                            }`}
                            aria-pressed={isDone}
                            className={`w-5 h-5 border-2 border-ink inline-block transition-colors ${
                              isDone ? "bg-ink" : "bg-transparent hover:bg-line/40"
                            }`}
                          />
                        </td>
                      );
                    })}
                    <td className="text-center font-mono text-sm py-2 pl-3 whitespace-nowrap">
                      {streak > 0 ? `${streak} дн.` : "—"}
                    </td>
                    <td className="pl-2">
                      <button
                        type="button"
                        onClick={() => handleRemove(habit.id)}
                        className="text-graphite hover:text-ink text-xs font-mono"
                        aria-label={`Удалить привычку «${habit.name}»`}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  );
}

function lastDays(n: number): Day[] {
  const result: Day[] = [];
  const today = new Date();
  const todayISO = toLocalISODate(today);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i
    );
    const iso = toLocalISODate(d);
    result.push({
      iso,
      weekday: d.toLocaleDateString("ru-RU", { weekday: "short" }).toUpperCase(),
      dayNum: d.getDate(),
      isToday: iso === todayISO,
    });
  }
  return result;
}
