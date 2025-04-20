import type { SettingsFormProps } from "@/components/settings/types.ts";
import { Fieldset, Flex, Group, Text, TextInput } from "@mantine/core";

interface CustomizeGroupProps extends SettingsFormProps {}
const CustomizeGroup = ({ form }: CustomizeGroupProps) => (
  <Fieldset legend="Customize">
    {/*Fonts*/}
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
          label="MonoSpace"
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`customize.font_family.monospace`)}
        />

        <TextInput
          label="Headings"
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`customize.font_family.headings`)}
        />
      </Group>
    </Flex>
  </Fieldset>
);

export default CustomizeGroup;
