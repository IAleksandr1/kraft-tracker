import { NextResponse } from "next/server";
import { getBalance, setBalance } from "@/lib/sheets";

export async function GET() {
  try {
    const balance = await getBalance();
    return NextResponse.json({ balance });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const balance = Number(body?.balance);

    if (Number.isNaN(balance)) {
      return NextResponse.json(
        { error: "Нужно передать число в поле balance" },
        { status: 400 }
      );
    }

    await setBalance(balance);
    return NextResponse.json({ ok: true, balance });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
