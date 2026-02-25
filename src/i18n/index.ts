import { ko } from './ko';
import { en } from './en';

export type Locale = 'ko' | 'en';

const messages: Record<Locale, typeof ko> = { ko, en };

let currentLocale: Locale = 'ko';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: keyof typeof ko): string {
  return messages[currentLocale][key] ?? messages.ko[key] ?? key;
}
