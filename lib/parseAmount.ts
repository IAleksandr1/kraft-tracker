/**
 * Находит первую сумму в тексте заметки.
 * Понимает "150", "150.5", "150,50", игнорирует номера телефонов/дат в простых случаях
 * за счёт того, что берёт число, стоящее рядом с ключевыми словами трат,
 * а если таких нет — первое число в тексте.
 */
const MONEY_HINT_WORDS =
  /(потратил[а]?|заплатил[а]?|отдал[а]?|стоил[о]?|купил[а]?|цена|сумма|руб|₽|рублей|рубля|р\.)/i;

export function parseAmount(text: string): number | null {
  if (!text) return null;

  const numberRegex = /(\d[\d\s]*(?:[.,]\d+)?)/g;
  const matches = [...text.matchAll(numberRegex)];
  if (matches.length === 0) return null;

  // Пытаемся найти число рядом со словом-подсказкой о трате
  for (const match of matches) {
    const idx = match.index ?? 0;
    const windowStart = Math.max(0, idx - 15);
    const windowEnd = Math.min(text.length, idx + match[0].length + 15);
    const surrounding = text.slice(windowStart, windowEnd);
    if (MONEY_HINT_WORDS.test(surrounding)) {
      return toNumber(match[0]);
    }
  }

  // Иначе берём первое число в тексте
  return toNumber(matches[0][0]);
}

function toNumber(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  const value = parseFloat(cleaned);
  return Number.isNaN(value) ? null : value;
}
