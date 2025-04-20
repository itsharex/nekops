import { Flex, Group, Text, TextInput } from "@mantine/core";
import type { SettingsFormProps } from "@/components/settings/types.ts";

interface FontsProps extends SettingsFormProps {}
const Fonts = ({ form }: FontsProps) => (
  <Flex direction="column">
    <Text size="sm" fw={500} mb={2}>
      Font Family
    </Text>

    <Group>
      <TextInput
        label="Common"
        style={{
          flexGrow: 1,
        }}
        {...form.getInputProps(`customize.font_family.common`)}
      />

      <TextInput
        label="Headings"
        style={{
          flexGrow: 1,
        }}
        {...form.getInputProps(`customize.font_family.headings`)}
      />
    </Group>

    <Group>
      <TextInput
        label="MonoSpace"
        style={{
          flexGrow: 1,
        }}
        {...form.getInputProps(`customize.font_family.monospace`)}
      />

      <TextInput
        label="Shell"
        style={{
          flexGrow: 1,
        }}
        {...form.getInputProps(`customize.shell.font_family`)}
      />
    </Group>
  </Flex>
);

export default Fonts;
