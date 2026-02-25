import { ko, type MessageKeys, type Messages } from './ko';
import { en } from './en';

export type Locale = 'ko' | 'en';

const messages: Record<Locale, Messages> = { ko, en };

let currentLocale: Locale = 'ko';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: MessageKeys): string {
  return messages[currentLocale][key] ?? messages.ko[key] ?? key;
}
