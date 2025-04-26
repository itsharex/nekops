import { open } from "@tauri-apps/plugin-dialog";
import { Accordion, Button, Center, Fieldset } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { homeDir, join } from "@tauri-apps/api/path";

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

  const selectSSHPrivateKey = async (index: number) => {
    const sshPrivateKey = await open({
      defaultPath: await join(await homeDir(), ".ssh"),
    });
    if (sshPrivateKey) {
      form.setFieldValue(`workspaces.${index}.ssh_private_key`, sshPrivateKey);
    }
  };

  return (
    <Fieldset legend={t("sectionWorkspaces")}>
      <Accordion>
        {form.values.workspaces.map((w: WorkSpace, index: number) => (
          <WorkspaceItem
            key={index}
            index={index}
            w={w}
            selectDataDirectory={() => {
              selectDataDirectory(index);
            }}
            selectSSHPrivateKey={() => {
              selectSSHPrivateKey(index);
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
          {t("workspaceButtonAdd")}
        </Button>
      </Center>
    </Fieldset>
  );
};

export default WorkspaceGroup;
