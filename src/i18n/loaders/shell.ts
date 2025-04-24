import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enUS from "@/i18n/locales/en-US/shell.json";
import zhCN from "@/i18n/locales/zh-CN/shell.json";

import { supportedLngs } from "../constants.ts";

const resources = {
  "en-US": {
    shell: enUS,
  },
  "zh-CN": {
    shell: zhCN,
  },
};

i18n
  .use(initReactI18next)
  .use(detector)
  .init({
    resources,
    supportedLngs,
    fallbackLng: "en-US",
    ns: ["shell"],
    defaultNS: "shell",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
