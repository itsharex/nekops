import type { SettingsFormProps } from "@/components/settings/types.ts";
import { Fieldset } from "@mantine/core";
import { useTranslation } from "react-i18next";

import Fonts from "./Fonts.tsx";
import Shell from "./Shell.tsx";

interface CustomizeGroupProps extends SettingsFormProps {}
const CustomizeGroup = ({ form }: CustomizeGroupProps) => {
  const { t } = useTranslation("main", { keyPrefix: "settings" });

  return (
    <Fieldset legend={t("sectionCustomize")}>
      <Fonts form={form} />
      <Shell form={form} />
    </Fieldset>
  );
};

export default CustomizeGroup;
