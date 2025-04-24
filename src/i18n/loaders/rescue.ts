import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enUS from "@/i18n/locales/en-US/rescue.json";
import zhCN from "@/i18n/locales/zh-CN/rescue.json";

import { supportedLngs } from "../constants.ts";

const resources = {
  "en-US": {
    rescue: enUS,
  },
  "zh-CN": {
    rescue: zhCN,
  },
};

i18n
  .use(initReactI18next)
  .use(detector)
  .init({
    resources,
    supportedLngs,
    fallbackLng: "en-US",
    ns: ["rescue"],
    defaultNS: "rescue",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
