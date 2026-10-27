import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --THIS FILE IS TO CONFIGURE AND START THE LIBRARY (FOR MULTI-LANG THING)

// Import your translation files
import en from './locales/en.json';
import ms from './locales/ms.json';

const resources = {
    en: en,
    ms: ms,
};

i18n
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        resources,
        compatibilityJSON: 'v3', // For React Native

        // Detect the user's language
        lng: Localization.locale,

        // If the user's language is not 'en' or 'ms', fall back to 'en'8
        fallbackLng: 'en',

        interpolation: {
            escapeValue: false, // React already safes from xss
        },
    });

export default i18n;