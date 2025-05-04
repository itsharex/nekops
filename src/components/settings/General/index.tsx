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

interface GeneralGroupProps extends SettingsFormProps {}
const GeneralGroup = ({ form }: GeneralGroupProps) => {
  const { t } = useTranslation("main", { keyPrefix: "settings" });

  return (
    <Fieldset legend={t("sectionGeneral")}>
      <Flex direction="column" gap="md">
        <LanguageSelector />

        <ColorSchemeSelector />

        {/*Default SSH Action*/}
        <Flex direction="column">
          <Text size="sm" fw={500} mb={2}>
            {t("generalDefaultSSHAction")}
          </Text>
          <SegmentedControl
            data={transformSegmentedControlOptions([
              {
                icon: IconCode,
                text: t("generalDefaultSSHAction_copy"),
                value: "copy",
              },
              {
                icon: IconRocket,
                text: t("generalDefaultSSHAction_start"),
                value: "start",
              },
            ])}
            {...form.getInputProps("default_ssh_action")}
          />
        </Flex>

        {/*Default SSH Client*/}
        <Flex direction="column">
          <Text size="sm" fw={500} mb={2}>
            {t("generalDefaultSSHClient")}
          </Text>
          <SegmentedControl
            data={transformSegmentedControlOptions([
              {
                icon: IconFlare,
                text: t("generalDefaultSSHClient_embedded"),
                value: "embedded",
              },
              {
                icon: IconMessageCircle,
                text: t("generalDefaultSSHClient_system"),
                value: "system",
              },
            ])}
            {...form.getInputProps("default_ssh_client")}
          />
        </Flex>

        {/*Check update*/}
        <Switch
          label={t("generalCheckUpdateAtStartup")}
          size="md"
          {...form.getInputProps("check_update_at_startup", {
            type: "checkbox",
          })}
        />
      </Flex>
    </Fieldset>
  );
};

export default GeneralGroup;
