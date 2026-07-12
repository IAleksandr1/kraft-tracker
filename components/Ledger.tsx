"use client";

import { useEffect, useState } from "react";

type Entry = {
  date: string;
  category: string;
  note: string;
  amount: string;
};

type DayGroup = {
  date: string;
  entries: Entry[];
  total: number;
};

export default function Ledger({ refreshKey }: { refreshKey: number }) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; groups: DayGroup[] }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetch("/api/entries")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
        return data.entries as Entry[];
      })
      .then((entries) => {
        if (cancelled) return;
        setState({ status: "ready", groups: groupByDay(entries) });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Ошибка загрузки",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="bg-paper border-2 border-ink relative">
      <div className="torn-edge" />
      <div className="p-5 sm:p-6">
        <h2 className="font-display text-lg tracking-tight mb-4">
          ТРЕКЕР ПО ДНЯМ
        </h2>

        {state.status === "loading" && (
          <p className="font-mono text-sm text-graphite">Загружаю таблицу…</p>
        )}

        {state.status === "error" && (
          <div className="border border-ink/40 bg-paper-dark p-3 text-sm font-mono">
            <p className="mb-1">Не получилось получить данные.</p>
            <p className="text-graphite">{state.message}</p>
          </div>
        )}

        {state.status === "ready" && state.groups.length === 0 && (
          <p className="font-mono text-sm text-graphite">
            Записей пока нет — напиши первую заметку слева, и она появится
            здесь.
          </p>
        )}

        {state.status === "ready" &&
          state.groups.map((group) => (
            <div key={group.date} className="mb-6 last:mb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b-2 border-ink pb-1 mb-2">
                <span className="font-display text-sm">
                  {formatDate(group.date)}
                </span>
                <span className="font-mono text-sm">
                  ИТОГО: {group.total.toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <div>
                {group.entries.map((entry, i) => (
                  <div
                    key={i}
                    className="ledger-row flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2 text-sm"
                  >
                    <span className="stamp shrink-0">{entry.category}</span>
                    <span className="font-mono flex-1 text-ink-soft">
                      {entry.note}
                    </span>
                    <span className="font-mono shrink-0 tabular-nums">
                      {entry.amount ? `${entry.amount} ₽` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function groupByDay(entries: Entry[]): DayGroup[] {
  const map = new Map<string, Entry[]>();
  for (const entry of entries) {
    const key = entry.date || "без даты";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }

  const groups: DayGroup[] = Array.from(map.entries()).map(
    ([date, dayEntries]) => ({
      date,
      entries: dayEntries,
      total: dayEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
    })
  );

  groups.sort((a, b) => (a.date < b.date ? 1 : -1));
  return groups;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}
