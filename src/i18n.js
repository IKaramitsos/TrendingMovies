import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en/translation.json';
import elTranslation from './locales/el/translation.json';

const savedLanguage = localStorage.getItem('language') || 'en';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslation,
            },
            el: {
                translation: elTranslation,
            },
        },
        lng: savedLanguage,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        returnNull: false,
    });

export default i18n;