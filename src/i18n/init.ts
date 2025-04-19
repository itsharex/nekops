import i18n from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .use(detector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    supportedLngs: ["en-US", "zh-CN"],
    fallbackLng: "en-US",
    load: "languageOnly",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    debug: true,
  });

export default i18n;
