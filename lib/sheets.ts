import { google } from "googleapis";

const SHEET_RANGE = "Entries!A:D";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !rawKey || !process.env.GOOGLE_SHEET_ID) {
    throw new Error(
      "Не заданы переменные окружения GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY / GOOGLE_SHEET_ID. Смотри README.md, раздел настройки."
    );
  }

  const privateKey = rawKey.replace(/\\n/g, "\n");

  return new google.auth.JWT(email, undefined, privateKey, [
    "https://www.googleapis.com/auth/spreadsheets",
  ]);
}

export type SheetEntry = {
  date: string;
  category: string;
  note: string;
  amount: string;
};

export async function getEntries(): Promise<SheetEntry[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: SHEET_RANGE,
  });

  const rows = res.data.values || [];
  // Первая строка — заголовок (Дата, Категория, Заметка, Сумма), пропускаем её
  const [, ...data] = rows;

  return data
    .filter((row) => row && row.length > 0)
    .map((row) => ({
      date: row[0] ?? "",
      category: row[1] ?? "",
      note: row[2] ?? "",
      amount: row[3] ?? "",
    }));
}

export async function appendEntry(entry: SheetEntry) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: SHEET_RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[entry.date, entry.category, entry.note, entry.amount]],
    },
  });
}

const HABITS_RANGE = "Habits!A:E";

export type HabitEvent = {
  timestamp: string;
  action: "add_habit" | "remove_habit" | "done" | "undone";
  habitId: string;
  habitName: string;
  date: string;
};

export async function getHabitEvents(): Promise<HabitEvent[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: HABITS_RANGE,
  });

  const rows = res.data.values || [];
  // Первая строка — заголовок (Timestamp, Action, HabitID, HabitName, Date)
  const [, ...data] = rows;

  return data
    .filter((row) => row && row.length > 0)
    .map((row) => ({
      timestamp: row[0] ?? "",
      action: (row[1] ?? "") as HabitEvent["action"],
      habitId: row[2] ?? "",
      habitName: row[3] ?? "",
      date: row[4] ?? "",
    }));
}

export async function appendHabitEvent(event: Omit<HabitEvent, "timestamp">) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: HABITS_RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          new Date().toISOString(),
          event.action,
          event.habitId,
          event.habitName,
          event.date,
        ],
      ],
    },
  });
}


// Лист "Balance" содержит одно число в ячейке A2 — текущий остаток денег.
// A1 — заголовок "Balance" (для наглядности, программой не используется).
const BALANCE_CELL = "Balance!A2";

export async function getBalance(): Promise<number> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: BALANCE_CELL,
  });

  const raw = res.data.values?.[0]?.[0];
  const value =
    raw === undefined || raw === null || raw === ""
      ? 0
      : parseFloat(String(raw).replace(",", "."));

  return Number.isNaN(value) ? 0 : value;
}

export async function setBalance(value: number) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: BALANCE_CELL,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[value]],
    },
  });
}
