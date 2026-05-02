import i18n from 'i18next'
import { initReactI18Next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '@/../public/locales/en/translation.json'
import es from '@/../public/locales/es/translation.json'
import fr from '@/../public/locales/fr/translation.json'
import de from '@/../public/locales/de/translation.json'
import nl from '@/../public/locales/nl/translation.json'
import zh from '@/../public/locales/zh/translation.json'
import ar from '@/../public/locales/ar/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18Next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      nl: { translation: nl },
      zh: { translation: zh },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
