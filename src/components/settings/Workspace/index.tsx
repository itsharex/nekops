import { open } from "@tauri-apps/plugin-dialog";
import { Accordion, Button, Center, Fieldset } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

import { defaultWorkspace, WorkSpace } from "@/types/settings.ts";
import type { SettingsFormProps } from "@/components/settings/types.ts";
import WorkspaceItem from "./Item.tsx";

interface WorkspaceGroupProps extends SettingsFormProps {}
const WorkspaceGroup = ({ form }: WorkspaceGroupProps) => {
  const { t } = useTranslation("main", { keyPrefix: "settings" });

  const selectDataDirectory = async (index: number) => {
    const dataDir = await open({
      directory: true,
    });
    if (dataDir) {
      form.setFieldValue(`workspaces.${index}.data_dir`, dataDir);
    }
  };

  const reorder = (sourceIndex: number, destinationIndex: number) => {
    const newWorkspaces = [...form.values.workspaces];
    const moved = newWorkspaces.splice(sourceIndex, 1);
    newWorkspaces.splice(destinationIndex, 0, ...moved);
    form.setFieldValue("workspaces", newWorkspaces);
  };

  return (
    <Fieldset legend={t("sectionWorkspaces")}>
      <DragDropContext
        onDragEnd={({ destination, source }) => {
          if (destination) {
            reorder(source.index, destination.index);
          }
        }}
      >
        <Droppable droppableId="workspaces" direction="vertical">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
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
                {provided.placeholder}
              </Accordion>
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Center mt="md">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() =>
            form.insertListItem("workspaces", structuredClone(defaultWorkspace))
          }
        >
          {t("workspaceButtonAdd")}
        </Button>
      </Center>
    </Fieldset>
  );
};

export default WorkspaceGroup;
