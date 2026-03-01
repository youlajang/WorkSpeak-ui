import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const LANG_STORAGE_KEY = "ws_lang";

// Only load these 6 locale files (reduces bundle and translation maintenance)
import enLocale from "./locales/en.json";
import koLocale from "./locales/ko.json";
import frLocale from "./locales/fr.json";
import jaLocale from "./locales/ja.json";
import zhLocale from "./locales/zh.json";
import zhTWLocale from "./locales/zh-TW.json";

function buildResources(): Record<string, { translation: Record<string, unknown> }> {
  return {
    en: { translation: enLocale as Record<string, unknown> },
    ko: { translation: koLocale as Record<string, unknown> },
    fr: { translation: frLocale as Record<string, unknown> },
    ja: { translation: jaLocale as Record<string, unknown> },
    zh: { translation: zhLocale as Record<string, unknown> },
    "zh-TW": { translation: zhTWLocale as Record<string, unknown> },
  };
}

export type SupportedLocale = "en" | "ko" | "fr" | "ja" | "zh" | "zh-TW";

export const SUPPORTED_LANGUAGES: { code: SupportedLocale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "简体中文", flag: "🇨🇳" },
  { code: "zh-TW", label: "繁體中文", flag: "🇹🇼" },
];

const ALL_CODES = new Set(SUPPORTED_LANGUAGES.map((x) => x.code));

function isSupported(code: string): code is SupportedLocale {
  return ALL_CODES.has(code as SupportedLocale);
}

/** Current or initial language as SupportedLocale (falls back to "en" if not in list). */
export function getInitialLocale(): SupportedLocale {
  const lang = getInitialLanguage();
  return isSupported(lang) ? lang : "en";
}

/** 위치 기반: 공용어가 앱에 있는 나라만 매핑. 그 외(벨기에·스위스·독일·스페인 등)는 전부 영어 추천 */
const COUNTRY_TO_LOCALE: Record<string, SupportedLocale> = {
  KR: "ko",
  KP: "ko",
  JP: "ja",
  CN: "zh",
  TW: "zh-TW",
  HK: "zh-TW",
  MO: "zh-TW",
  FR: "fr",
};

export function getInitialLanguage(): string {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (saved && isSupported(saved)) return saved;
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith("zh-tw") || browser.startsWith("zh-hant")) return "zh-TW";
  if (browser.startsWith("zh")) return "zh";
  for (const { code } of SUPPORTED_LANGUAGES) {
    if (code === "zh" || code === "zh-TW") continue;
    if (browser.startsWith(code)) return code;
  }
  return "en";
}

/** Fetch country from Geo IP API and return suggested locale. Resolves to getInitialLanguage() on failure. */
export function fetchSuggestedLocale(): Promise<SupportedLocale> {
  const init = getInitialLanguage();
  const fallback = (isSupported(init) ? init : "en") as SupportedLocale;
  if (typeof window === "undefined") return Promise.resolve(fallback);

  return fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) })
    .then((r) => r.json())
    .then((data: { country_code?: string }) => {
      const code = data?.country_code?.toUpperCase();
      if (code && code in COUNTRY_TO_LOCALE) {
        return COUNTRY_TO_LOCALE[code];
      }
      return "en";
    })
    .catch(() => fallback);
}

/** Order SUPPORTED_LANGUAGES so the given locale appears first. */
export function sortLanguagesWithFirst(
  preferred: SupportedLocale
): { code: SupportedLocale; label: string; flag: string }[] {
  const list = [...SUPPORTED_LANGUAGES];
  const idx = list.findIndex((x) => x.code === preferred);
  if (idx <= 0) return list;
  const [item] = list.splice(idx, 1);
  return [item, ...list];
}

i18n.use(initReactI18next).init({
  resources: buildResources(),
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LANG_STORAGE_KEY, lng);
  }
});

export default i18n;
