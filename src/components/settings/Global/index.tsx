import { Fieldset, Flex, SegmentedControl, Text } from "@mantine/core";
import {
  IconCode,
  IconFlare,
  IconMessageCircle,
  IconRocket,
} from "@tabler/icons-react";

import type { SettingsFormProps } from "@/components/settings/types.ts";
import { transformSegmentedControlOptions } from "@/components/settings/utils.tsx";

import ColorSchemeSelector from "./ColorSchemeSelector.tsx";
import LanguageSelector from "./LanguageSelector.tsx";

interface GlobalGroupProps extends SettingsFormProps {}
const GlobalGroup = ({ form }: GlobalGroupProps) => (
  <Fieldset legend="Global">
    <Flex direction="column" gap="md">
      <LanguageSelector />

      <ColorSchemeSelector />

      {/*Default SSH Action*/}
      <Flex direction="column">
        <Text size="sm" fw={500} mb={2}>
          Default SSH Action
        </Text>
        <SegmentedControl
          data={transformSegmentedControlOptions([
            {
              icon: IconCode,
              text: "Copy Command",
              value: "copy",
            },
            {
              icon: IconRocket,
              text: "Start Session",
              value: "start",
            },
          ])}
          {...form.getInputProps("default_ssh_action")}
        />
      </Flex>

      {/*Default SSH Client*/}
      <Flex direction="column">
        <Text size="sm" fw={500} mb={2}>
          Default SSH Client
        </Text>
        <SegmentedControl
          data={transformSegmentedControlOptions([
            {
              icon: IconFlare,
              text: "Embedded",
              value: "embedded",
            },
            {
              icon: IconMessageCircle,
              text: "System",
              value: "system",
            },
          ])}
          {...form.getInputProps("default_ssh_client")}
        />
      </Flex>
    </Flex>
  </Fieldset>
);

export default GlobalGroup;
