import { Code, Select } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";

import { languageName } from "@/i18n/locales/constants.ts";

const LanguageSelector = () => {
  const { t, i18n } = useTranslation("main", { keyPrefix: "settings" });

  return (
    <Select
      label={t("globalLanguage")}
      data={Object.entries(languageName).map(([id, name]) => ({
        value: id,
        label: name,
      }))}
      value={i18n.language}
      onChange={(value, option) => {
        if (value !== null) {
          i18n
            .changeLanguage(value)
            .then(() => {
              notifications.show({
                color: "green",
                title: t("languageChangeSuccess"),
                message: (
                  <>
                    {t("languageChangeSuccess_messageBefore")}{" "}
                    <Code>{option.label}</Code>
                  </>
                ),
              });
            })
            .catch((e) => {
              notifications.show({
                color: "red",
                title: t("languageChangeFail"),
                message: e,
              });
            });
        }
      }}
    />
  );
};

export default LanguageSelector;
