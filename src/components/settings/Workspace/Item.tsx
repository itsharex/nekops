import type { WorkSpace } from "@/types/settings.ts";
import {
  Accordion,
  ActionIcon,
  Center,
  Grid,
  Group,
  TextInput,
  Tooltip,
} from "@mantine/core";
import DeleteItemButton from "@/components/DeleteItemButton.tsx";
import { IconFolder } from "@tabler/icons-react";
import { actionIconStyle } from "@/common/actionStyles.ts";

import { SettingsFormProps } from "@/components/settings/types.ts";

interface WorkspaceItemProps extends SettingsFormProps {
  w: WorkSpace;
  index: number;
  selectDataDirectory: () => void;
}
const WorkspaceItem = ({
  w,
  index,
  selectDataDirectory,
  form,
}: WorkspaceItemProps) => (
  <Accordion.Item value={`workspace_${index}`}>
    <Center>
      <Accordion.Control>{w.name}</Accordion.Control>
      <DeleteItemButton
        size={"lg"}
        variant={"subtle"}
        itemName={w.name}
        onClick={() => form.removeListItem("workspaces", index)}
      />
    </Center>
    <Accordion.Panel>
      <Grid>
        <Grid.Col span={4}>
          <TextInput
            label="ID"
            {...form.getInputProps(`workspaces.${index}.id`)}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <TextInput
            label="Name"
            {...form.getInputProps(`workspaces.${index}.name`)}
          />
        </Grid.Col>
      </Grid>

      <Group>
        <TextInput
          label="Data Directory"
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(`workspaces.${index}.data_dir`)}
        />

        <Tooltip label="Select" openDelay={500}>
          <ActionIcon
            size="lg"
            onClick={selectDataDirectory}
            style={{
              alignSelf: "end",
            }}
          >
            <IconFolder style={actionIconStyle} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Accordion.Panel>
  </Accordion.Item>
);

export default WorkspaceItem;
