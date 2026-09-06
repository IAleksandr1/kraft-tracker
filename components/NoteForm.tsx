"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_CATEGORIES,
  addCustomCategory,
  getAllCategories,
} from "@/lib/categories";
import { parseAmount } from "@/lib/parseAmount";

export default function NoteForm({ onSaved }: { onSaved: () => void }) {
  const [note, setNote] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [amount, setAmount] = useState<string>("");
  const [amountTouched, setAmountTouched] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setCategories(getAllCategories());
  }, []);

  const detectedAmount = useMemo(() => parseAmount(note), [note]);

  useEffect(() => {
    if (!amountTouched && detectedAmount !== null) {
      setAmount(String(detectedAmount));
    }
  }, [detectedAmount, amountTouched]);

  function handleAddCategory() {
    const updatedCustom = addCustomCategory(newCategory);
    setCategories([...DEFAULT_CATEGORIES, ...updatedCustom]);
    if (newCategory.trim()) setCategory(newCategory.trim());
    setNewCategory("");
    setAddingCategory(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;

    setStatus("saving");
    setErrorMessage("");

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          category,
          note: note.trim(),
          amount: amount === "" ? null : amount,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Не получилось сохранить запись");
      }

      setNote("");
      setAmount("");
      setAmountTouched(false);
      setStatus("idle");
      onSaved();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-paper border-2 border-ink p-5 sm:p-6 relative shadow-[6px_6px_0_0_#161513]"
    >
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-base tracking-tight">Сколько денег сейчас:</h2>
      </div>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-lg tracking-tight">НОВАЯ ЗАПИСЬ</h2>
        <span className="stamp">{today()}</span>
      </div>

      <label className="block text-xs uppercase tracking-widest text-graphite mb-1">
        Заметка
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Например: потратил 150 рублей на кофе"
        rows={3}
        required
        className="w-full bg-transparent border border-line focus:border-ink outline-none p-3 mb-4 font-mono text-sm resize-none placeholder:text-graphite/60"
      />

      <div className="w-fullgrid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-graphite mb-1">
            Тема
          </label>
          {!addingCategory ? (
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 bg-transparent border border-line focus:border-ink outline-none p-2 font-mono text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setAddingCategory(true)}
                className="border border-ink px-2 text-sm hover:bg-ink hover:text-paper transition-colors"
                aria-label="Добавить свою тему"
              >
                +
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                placeholder="Своя тема"
                className="flex-1 bg-transparent border border-line focus:border-ink outline-none p-2 font-mono text-sm"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="border border-ink px-3 text-sm hover:bg-ink hover:text-paper transition-colors"
              >
                ОК
              </button>
            </div>
          )}
        </div>
<br />
        <div>
          <label className="block text-xs uppercase tracking-widest text-graphite mb-1">
            Сумма, ₽ {detectedAmount !== null && !amountTouched && "(найдена автоматически)"}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setAmountTouched(true);
            }}
            placeholder="0"
            className="w-full bg-transparent border border-line focus:border-ink outline-none p-2 font-mono text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full sm:w-auto font-display text-sm bg-ink text-paper px-6 py-3 tracking-wide hover:bg-ink-soft disabled:opacity-50 transition-colors"
      >
        {status === "saving" ? "СОХРАНЯЮ…" : "ЗАПИСАТЬ"}
      </button>

      {status === "error" && (
        <p className="mt-3 text-sm text-ink border border-ink/40 bg-paper-dark p-2">
          Не получилось: {errorMessage}
        </p>
      )}
    </form>
  );
}

function today() {
  return new Date().toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
