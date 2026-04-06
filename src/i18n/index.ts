import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { I18nManager } from "react-native";

import en from "./translations/en.json";
import ar from "./translations/ar.json";
import fr from "./translations/fr.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
};

// 1. Detect device language synchronously, default to 'en'
const deviceLocales = Localization.getLocales();
let lng = "en";
if (deviceLocales && deviceLocales.length > 0) {
  const deviceLang = deviceLocales[0].languageCode;
  if (deviceLang && ["en", "ar", "fr"].includes(deviceLang)) {
    lng = deviceLang;
  }
}

// 2. Initialize the translation engine synchronously (resources are bundled, no async loading needed)
// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources,
  lng,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// 3. RTL — mirror the UI layout for Arabic
const isRTL = lng === "ar";
if (I18nManager.isRTL !== isRTL) {
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
}

export default i18n;
