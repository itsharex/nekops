import { Flex, Group, Text, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";

import type { SettingsFormProps } from "@/components/settings/types.ts";

interface FontsProps extends SettingsFormProps {}
const Fonts = ({ form }: FontsProps) => {
  const { t } = useTranslation("main", { keyPrefix: "settings" });

  return (
    <Flex direction="column">
      <Text size="sm" fw={500} mb={2}>
        {t("customizeFontFamily")}
      </Text>

      <Group>
        <TextInput
          label={t("customizeFontFamily_common")}
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`customize.font_family.common`)}
        />

        <TextInput
          label={t("customizeFontFamily_headings")}
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`customize.font_family.headings`)}
        />
      </Group>

      <Group>
        <TextInput
          label={t("customizeFontFamily_monospace")}
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`customize.font_family.monospace`)}
        />

        <TextInput
          label={t("customizeFontFamily_shell")}
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`customize.shell.font_family`)}
        />
      </Group>
    </Flex>
  );
};

export default Fonts;
