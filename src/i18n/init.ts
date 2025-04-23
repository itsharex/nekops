import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enUS from "@/i18n/locales/en-US.json";
import zhCN from "@/i18n/locales/zh-CN.json";

export const resources = {
  "en-US": {
    name: "English (United States)",
    translation: enUS,
  },
  "zh-CN": {
    name: "中文（简体）",
    translation: zhCN,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(detector)
  .init({
    resources,
    supportedLngs: ["en-US", "zh-CN"],
    fallbackLng: "en-US",
    // load: "languageOnly",
    // ns: ["main", "shell", "rescue"],
    // defaultNS: false,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },

    // For debug only
    // lng: "cimode",
    // appendNamespaceToCIMode: true,
    // debug: true,
  });

export default i18n;
