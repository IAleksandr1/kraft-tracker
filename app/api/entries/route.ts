import { NextResponse } from "next/server";
import { appendEntry, getBalance, getEntries, setBalance } from "@/lib/sheets";

export async function GET() {
  try {
    const entries = await getEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, category, note, amount } = body ?? {};

    if (!note || typeof note !== "string") {
      return NextResponse.json(
        { error: "Текст заметки обязателен" },
        { status: 400 }
      );
    }

    await appendEntry({
      date: date || new Date().toISOString().slice(0, 10),
      category: category || "Другое",
      note,
      amount: amount === null || amount === undefined ? "" : String(amount),
    });

    // Если в заметке указана сумма — вычитаем её из текущего остатка
    const parsedAmount =
      amount === null || amount === undefined || amount === ""
        ? null
        : parseFloat(String(amount).replace(",", "."));

    let balance: number | null = null;
    if (parsedAmount !== null && !Number.isNaN(parsedAmount)) {
      const current = await getBalance();
      balance = current - parsedAmount;
      await setBalance(balance);
    }

    return NextResponse.json({ ok: true, balance });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
