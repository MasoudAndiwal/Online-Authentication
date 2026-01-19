/**
 * i18next Configuration for Office Messaging System
 * 
 * Supports English (LTR), Dari/Farsi (RTL), and Pashto (RTL)
 * 
 * Requirements: 25.1, 25.2, 25.3, 25.9
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Language resources will be imported from separate files
import enTranslations from './locales/en/messaging.json';
import faTranslations from './locales/fa/messaging.json';
import psTranslations from './locales/ps/messaging.json';

export const supportedLanguages = {
  en: { name: 'English', direction: 'ltr' },
  fa: { name: 'دری', direction: 'rtl' }, // Dari
  ps: { name: 'پښتو', direction: 'rtl' }, // Pashto
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

const resources = {
  en: { messaging: enTranslations },
  fa: { messaging: faTranslations },
  ps: { messaging: psTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'messaging',
    ns: ['messaging'],
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'office-messaging-language',
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
