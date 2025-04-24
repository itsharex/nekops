import {
  ActionIcon,
  ColorInput,
  Flex,
  Group,
  NumberInput,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import { open } from "@tauri-apps/plugin-dialog";
import { useTranslation } from "react-i18next";

import type { SettingsFormProps } from "@/components/settings/types.ts";
import { actionIconStyle } from "@/common/actionStyles.ts";

interface ShellProps extends SettingsFormProps {}
const Shell = ({ form }: ShellProps) => {
  const { t } = useTranslation("main", { keyPrefix: "settings" });

  const selectBackgroundImage = async () => {
    const dataFile = await open({
      multiple: false,
      filters: [
        {
          name: "Image",
          extensions: ["svg", "webp", "png", "jpg", "jpeg"],
        },
      ],
    });
    if (dataFile) {
      form.setFieldValue(`customize.shell.background_image`, dataFile);
    }
  };

  return (
    <Flex direction="column" mt="md">
      <Text size="sm" fw={500} mb={2}>
        {t("customizeShell")}
      </Text>

      <Group>
        <ColorInput
          label={t("customizeShell_bgColor")}
          format="hexa"
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`customize.shell.background_color`)}
        />

        <ColorInput
          label={t("customizeShell_fgColor")}
          format="hexa"
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`customize.shell.foreground_color`)}
        />

        <NumberInput
          label={t("customizeShell_fontSize")}
          min={1}
          allowNegative={false}
          allowDecimal={false}
          allowLeadingZeros={false}
          {...form.getInputProps(`customize.shell.font_size`)}
        />
      </Group>

      <Group>
        <TextInput
          label={t("customizeShell_bgImage")}
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`customize.shell.background_image`)}
        />

        <Tooltip
          label={t("customizeShell_bgImageActionSelect")}
          openDelay={500}
        >
          <ActionIcon
            size="lg"
            onClick={selectBackgroundImage}
            style={{
              alignSelf: "end",
            }}
          >
            <IconPhoto style={actionIconStyle} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Flex>
  );
};

export default Shell;
