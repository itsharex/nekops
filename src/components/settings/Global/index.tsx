import { Fieldset, Flex, SegmentedControl, Switch, Text } from "@mantine/core";
import {
  IconCode,
  IconFlare,
  IconMessageCircle,
  IconRocket,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import type { SettingsFormProps } from "@/components/settings/types.ts";
import { transformSegmentedControlOptions } from "@/components/settings/utils.tsx";

import ColorSchemeSelector from "./ColorSchemeSelector.tsx";
import LanguageSelector from "./LanguageSelector.tsx";

interface GlobalGroupProps extends SettingsFormProps {}
const GlobalGroup = ({ form }: GlobalGroupProps) => {
  const { t } = useTranslation("main", { keyPrefix: "settings" });

  return (
    <Fieldset legend={t("sectionGlobal")}>
      <Flex direction="column" gap="md">
        <LanguageSelector />

        <ColorSchemeSelector />

        {/*Default SSH Action*/}
        <Flex direction="column">
          <Text size="sm" fw={500} mb={2}>
            {t("globalDefaultSSHAction")}
          </Text>
          <SegmentedControl
            data={transformSegmentedControlOptions([
              {
                icon: IconCode,
                text: t("globalDefaultSSHAction_copy"),
                value: "copy",
              },
              {
                icon: IconRocket,
                text: t("globalDefaultSSHAction_start"),
                value: "start",
              },
            ])}
            {...form.getInputProps("default_ssh_action")}
          />
        </Flex>

        {/*Default SSH Client*/}
        <Flex direction="column">
          <Text size="sm" fw={500} mb={2}>
            {t("globalDefaultSSHClient")}
          </Text>
          <SegmentedControl
            data={transformSegmentedControlOptions([
              {
                icon: IconFlare,
                text: t("globalDefaultSSHClient_embedded"),
                value: "embedded",
              },
              {
                icon: IconMessageCircle,
                text: t("globalDefaultSSHClient_system"),
                value: "system",
              },
            ])}
            {...form.getInputProps("default_ssh_client")}
          />
        </Flex>

        {/*Check update*/}
        <Switch
          label={t("globalCheckUpdateAtStartup")}
          size="md"
          {...form.getInputProps("check_update_at_startup", {
            type: "checkbox",
          })}
        />
      </Flex>
    </Fieldset>
  );
};

export default GlobalGroup;
