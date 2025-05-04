import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { fallbackLng, supportedLngs } from "@/i18n/locales/constants.ts";
import { resources } from "@/i18n/locales/resources_rescue.ts";

i18n
  .use(initReactI18next)
  .use(detector)
  .init({
    resources,
    supportedLngs,
    fallbackLng,
    ns: ["rescue"],
    defaultNS: "rescue",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
