import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { fallbackLng, supportedLngs } from "@/i18n/locales/constants.ts";
import { resources } from "@/i18n/locales/resources_main.ts";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(detector)
  .init({
    resources,
    supportedLngs,
    fallbackLng,
    // load: "languageOnly",
    ns: ["main"],
    defaultNS: "main",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },

    // For debug only
    // lng: "cimode",
    // appendNamespaceToCIMode: true,
    // debug: true,
  });

export default i18n;
