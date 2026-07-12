export const DEFAULT_CATEGORIES = [
  "Еда",
  "Транспорт",
  "Жильё",
  "Здоровье",
  "Развлечения",
  "Покупки",
  "Работа",
  "Другое",
];

const STORAGE_KEY = "kraft-tracker:custom-categories";

export function getCustomCategories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addCustomCategory(name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed) return getCustomCategories();
  const current = getCustomCategories();
  if (
    current.includes(trimmed) ||
    DEFAULT_CATEGORIES.includes(trimmed)
  ) {
    return current;
  }
  const updated = [...current, trimmed];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function getAllCategories(): string[] {
  return [...DEFAULT_CATEGORIES, ...getCustomCategories()];
}
