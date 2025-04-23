import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enUS_main from "@/i18n/locales/en-US/main.json";
import zhCN_main from "@/i18n/locales/zh-CN/main.json";

const supportedLngs = ["en-US", "zh-CN"];

const resources = {
  "en-US": {
    main: enUS_main,
  },
  "zh-CN": {
    main: zhCN_main,
  },
};

export const languageName = {
  "en-US": "English (United States)",
  "zh-CN": "中文（简体）",
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(detector)
  .init({
    resources,
    supportedLngs,
    fallbackLng: "en-US",
    // load: "languageOnly",
    ns: ["main", "shell", "rescue"],
    defaultNS: false,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },

    // For debug only
    // lng: "cimode",
    // appendNamespaceToCIMode: true,
    // debug: true,
  });

export default i18n;
