"use client";

import { useState } from "react";
import Home from "@/components/Home";
import BalanceCard from "@/components/BalanceCard";
import NoteForm from "@/components/NoteForm";
import Ledger from "@/components/Ledger";
import HabitTracker from "@/components/HabitTracker";

type Tab = "home" | "accounting" | "habits";

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen px-4 sm:px-8 py-10 sm:py-14 max-w-5xl mx-auto">
      <header className="mb-8 sm:mb-10">
        <p className="stamp mb-3">личный журнал</p>
        <h1 className="font-display text-4xl sm:text-6xl leading-none tracking-tight">
          ЖУРНАЛ.
        </h1>
        <p className="font-mono text-sm text-graphite mt-3 max-w-md">
          Заметки и привычки — всё уходит в одну Google Таблицу, на разные
          листы.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2 px-1" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "home"}
          onClick={() => setTab("home")}
          className={`folder-tab text-[11px] sm:text-xs ${
            tab === "home" ? "active" : ""
          }`}
        >
          Главная
        </button>
        <button
          role="tab"
          aria-selected={tab === "accounting"}
          onClick={() => setTab("accounting")}
          className={`folder-tab text-[11px] sm:text-xs ${
            tab === "accounting" ? "active" : ""
          }`}
        >
          Заметки
        </button>
        <button
          role="tab"
          aria-selected={tab === "habits"}
          onClick={() => setTab("habits")}
          className={`folder-tab text-[11px] sm:text-xs ${
            tab === "habits" ? "active" : ""
          }`}
        >
          Привычки
        </button>
      </nav>

      {tab === "home" && <Home onNavigate={(t) => setTab(t)} />}

      {tab === "accounting" && (
        <div className="pt-6">
          <BalanceCard refreshKey={refreshKey} />
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,340px)_1fr] gap-5 sm:gap-6 md:gap-8 items-start">
            <NoteForm onSaved={() => setRefreshKey((k) => k + 1)} />
            <Ledger refreshKey={refreshKey} />
          </div>
        </div>
      )}

      {tab === "habits" && (
        <div className="pt-6">
          <HabitTracker />
        </div>
      )}

      <footer className="mt-14 text-xs font-mono text-graphite/70 text-center">
        заметки и привычки — в одной Google Таблице, на разных листах
      </footer>
    </main>
  );
}
