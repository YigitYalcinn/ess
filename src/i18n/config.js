import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './translations/tr.json';
import en from './translations/en.json';
import ru from './translations/ru.json';

// Blogdan /?lang=en gibi bir adresle gelindiyse o dili aç
const SUPPORTED = ['tr', 'en', 'ru'];
const urlLang = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : null;
const initialLang = SUPPORTED.includes(urlLang) ? urlLang : 'tr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      ru: { translation: ru }
    },
    lng: initialLang, // varsayılan: tr
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
