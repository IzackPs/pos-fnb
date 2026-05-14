import type { Locale } from "./index";

// === VI ===
import { vi } from "./vi";

// === EN ===
import { en } from "./en";

// === ZH ===
import { zh } from "./zh";

// === KO ===
import { ko } from "./ko";

// === JA ===
import { ja } from "./ja";

const dictionaries: Record<Locale, typeof vi> = { vi, en, zh, ko, ja };

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || vi;
}

export type Dictionary = typeof vi;
