import type { SettingsFormProps } from "@/components/settings/types.ts";
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
import { actionIconStyle } from "@/common/actionStyles.ts";
import { open } from "@tauri-apps/plugin-dialog";

interface ShellProps extends SettingsFormProps {}
const Shell = ({ form }: ShellProps) => {
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
        Shell
      </Text>

      <Group>
        <ColorInput
          label="Background Color"
          format="hexa"
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`customize.shell.background_color`)}
        />

        <ColorInput
          label="Foreground Color"
          format="hexa"
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`customize.shell.foreground_color`)}
        />

        <NumberInput
          label="Font Size"
          min={1}
          allowNegative={false}
          allowDecimal={false}
          allowLeadingZeros={false}
          {...form.getInputProps(`customize.shell.font_size`)}
        />
      </Group>

      <Group>
        <TextInput
          label="Background Image"
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`customize.shell.background_image`)}
        />

        <Tooltip label="Select" openDelay={500}>
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
