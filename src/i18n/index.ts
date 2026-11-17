import type { I18nProvider } from "@refinedev/core";
import en from "./en";
import id from "./id";

const translations: Record<string, Record<string, string>> = {
  en: en as Record<string, string>,
  id: id as Record<string, string>,
};

const LOCALE_KEY = "rsvquick_locale";

let currentLocale = localStorage.getItem(LOCALE_KEY) ?? "id";

function interpolate(str: string, params?: Record<string, string | number>) {
  if (!params) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? `{{${key}}}`));
}

export function getLocale() {
  return currentLocale;
}

export function setLocale(locale: string) {
  currentLocale = locale;
  localStorage.setItem(LOCALE_KEY, locale);
  window.dispatchEvent(new Event("locale-change"));
}

export const i18nProvider: I18nProvider = {
  translate: (key: string, options?: any, defaultMessage?: string) => {
    const dict = translations[currentLocale] ?? translations.id;
    const value = (dict as Record<string, string>)[key];
    if (!value) return defaultMessage ?? key;
    if (options && typeof options === "object") {
      return interpolate(value, options);
    }
    return value;
  },
  changeLocale: async (locale: string) => {
    setLocale(locale);
  },
  getLocale: () => currentLocale,
};

export default i18nProvider;
