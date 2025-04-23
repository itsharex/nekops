import { Code, Select } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";

import { languageName } from "@/i18n/init.ts";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  return (
    <Select
      label={"Language"}
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
                title: "Language changed successfully",
                message: (
                  <>
                    Current language is <Code>{option.label}</Code>
                  </>
                ),
              });
            })
            .catch((e) => {
              notifications.show({
                color: "red",
                title: "Failed to change language",
                message: e,
              });
            });
        }
      }}
    />
  );
};

export default LanguageSelector;
