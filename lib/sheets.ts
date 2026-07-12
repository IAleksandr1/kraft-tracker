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
