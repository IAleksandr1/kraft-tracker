"use client";

import { useEffect, useState } from "react";

export default function BalanceCard({ refreshKey }: { refreshKey: number }) {
  const [balance, setBalanceValue] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetch("/api/balance")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
        return data.balance as number;
      })
      .then((value) => {
        if (cancelled) return;
        setBalanceValue(value);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : "Ошибка загрузки");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  function startEditing() {
    setInputValue(balance !== null ? String(balance) : "");
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(inputValue.replace(",", "."));
    if (Number.isNaN(value)) return;

    setSaving(true);
    try {
      const res = await fetch("/api/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Не получилось сохранить");
      }
      setBalanceValue(value);
      setEditing(false);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Ошибка сохранения");
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-paper border-2 border-ink p-5 sm:p-6 mb-5 sm:mb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-graphite mb-1">
            текущий остаток
          </p>

          {status === "loading" && (
            <p className="font-mono text-sm text-graphite">Загружаю…</p>
          )}

          {status === "error" && !editing && (
            <p className="font-mono text-sm text-graphite">
              Не получилось загрузить: {errorMessage}
            </p>
          )}

          {status === "ready" && !editing && (
            <p className="font-display text-2xl sm:text-3xl">
              {balance?.toLocaleString("ru-RU")} ₽
            </p>
          )}

          {editing && (
            <form onSubmit={handleSave} className="flex gap-2 items-center mt-1">
              <input
                autoFocus
                inputMode="decimal"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0"
                className="bg-transparent border border-line focus:border-ink outline-none p-2 font-mono text-sm w-32"
              />
              <button
                type="submit"
                disabled={saving}
                className="border-2 border-ink px-3 py-1.5 font-display text-xs hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
              >
                {saving ? "…" : "OK"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-graphite text-xs font-mono hover:text-ink"
              >
                отмена
              </button>
            </form>
          )}
        </div>

        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="font-mono text-sm border-b-2 border-ink hover:pl-1 transition-all shrink-0"
          >
            {status === "ready" ? "Изменить →" : "Указать сумму →"}
          </button>
        )}
      </div>
    </div>
  );
}
