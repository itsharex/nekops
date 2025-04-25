import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enUS from "@/i18n/locales/en-US/main.json";
import zhCN from "@/i18n/locales/zh-CN/main.json";

import { supportedLngs } from "../constants.ts";

const resources = {
  "en-US": {
    main: enUS,
  },
  "zh-CN": {
    main: zhCN,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(detector)
  .init({
    resources,
    supportedLngs,
    fallbackLng: "en-US",
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
