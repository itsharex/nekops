import { open } from "@tauri-apps/plugin-dialog";
import { Accordion, Button, Center, Fieldset } from "@mantine/core";
import { defaultWorkspace, WorkSpace } from "@/types/settings.ts";
import { IconPlus } from "@tabler/icons-react";

import type { SettingsFormProps } from "@/components/settings/types.ts";
import WorkspaceItem from "./Item.tsx";

interface WorkspaceGroupProps extends SettingsFormProps {}
const WorkspaceGroup = ({ form }: WorkspaceGroupProps) => {
  const selectDataDirectory = async (index: number) => {
    const dataDir = await open({
      multiple: false,
      directory: true,
    });
    if (dataDir) {
      form.setFieldValue(`workspaces.${index}.data_dir`, dataDir);
    }
  };

  return (
    <Fieldset legend="Workspaces">
      <Accordion>
        {form.values.workspaces.map((w: WorkSpace, index: number) => (
          <WorkspaceItem
            key={index}
            index={index}
            w={w}
            selectDataDirectory={() => {
              selectDataDirectory(index);
            }}
            form={form}
          />
        ))}
      </Accordion>
      <Center mt="md">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() =>
            form.insertListItem("workspaces", structuredClone(defaultWorkspace))
          }
        >
          Add
        </Button>
      </Center>
    </Fieldset>
  );
};

export default WorkspaceGroup;
