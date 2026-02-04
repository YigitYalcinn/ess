import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './translations/tr.json';
import en from './translations/en.json';
import ru from './translations/ru.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      ru: { translation: ru }
    },
    lng: 'tr', // default language
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
