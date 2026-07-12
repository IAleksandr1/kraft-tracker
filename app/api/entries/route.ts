import { NextResponse } from "next/server";
import { appendEntry, getEntries } from "@/lib/sheets";

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

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
