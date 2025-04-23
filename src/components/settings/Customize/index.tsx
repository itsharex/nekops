import type { SettingsFormProps } from "@/components/settings/types.ts";
import { Fieldset } from "@mantine/core";

import Fonts from "./Fonts.tsx";
import Shell from "./Shell.tsx";

interface CustomizeGroupProps extends SettingsFormProps {}
const CustomizeGroup = ({ form }: CustomizeGroupProps) => (
  <Fieldset legend="Customize">
    <Fonts form={form} />
    <Shell form={form} />
  </Fieldset>
);

export default CustomizeGroup;
