import { NextResponse } from "next/server";
import { appendHabitEvent, getHabitEvents } from "@/lib/sheets";
import { processHabitEvents } from "@/lib/habits";

export async function GET() {
  try {
    const events = await getHabitEvents();
    const { habits, completions } = processHabitEvents(events);
    return NextResponse.json({ habits, completions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, habitId, habitName, date } = body ?? {};

    const allowedActions = ["add_habit", "remove_habit", "done", "undone"];
    if (!action || !allowedActions.includes(action) || !habitId) {
      return NextResponse.json(
        { error: "Нужны корректные action и habitId" },
        { status: 400 }
      );
    }

    await appendHabitEvent({
      action,
      habitId,
      habitName: habitName || "",
      date: date || "",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
