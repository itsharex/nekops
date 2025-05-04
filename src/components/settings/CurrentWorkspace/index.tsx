import {
  ActionIcon,
  Fieldset,
  Group,
  PasswordInput,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconKey, IconLock, IconLockOpen } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { homeDir, join } from "@tauri-apps/api/path";

import { actionIconStyle } from "@/common/actionStyles.ts";
import type { SettingsFormProps } from "@/components/settings/types.ts";

interface CurrentWorkspaceGroupProps extends SettingsFormProps {
  isUnlocked: boolean;
  openUnlockModal: () => void;
  currentWorkspaceIndex: number;
}
const CurrentWorkspaceGroup = ({
  form,
  isUnlocked,
  openUnlockModal,
  currentWorkspaceIndex,
}: CurrentWorkspaceGroupProps) => {
  const { t } = useTranslation("main", { keyPrefix: "settings" });

  const selectSSHPrivateKey = async () => {
    const sshPrivateKey = await open({
      defaultPath: await join(await homeDir(), ".ssh"),
    });
    if (sshPrivateKey) {
      form.setFieldValue(
        `workspaces.${currentWorkspaceIndex}.ssh_private_key`,
        sshPrivateKey,
      );
    }
  };

  return (
    <Fieldset legend={t("sectionCurrentWorkspace")}>
      <Group>
        <PasswordInput
          label={t("currentWorkspacePasswordLabel")}
          disabled={!isUnlocked}
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps("password")}
        />

        <Tooltip label={t("currentWorkspaceUnlockLabel")} openDelay={500}>
          <ActionIcon
            size="lg"
            color={isUnlocked ? "green" : "orange"}
            onClick={() => {
              if (isUnlocked) {
                notifications.show({
                  color: "green",
                  title: t("currentWorkspaceAlreadyUnlockNotificationTitle"),
                  message: t("unlockSuccessMessage"),
                });
              } else {
                openUnlockModal();
              }
            }}
            style={{
              alignSelf: "end",
            }}
          >
            {isUnlocked ? (
              <IconLockOpen style={actionIconStyle} />
            ) : (
              <IconLock style={actionIconStyle} />
            )}
          </ActionIcon>
        </Tooltip>
      </Group>

      <Group>
        <TextInput
          label={t("workspaceSSHPrivateKeyLabel")}
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps(
            `workspaces.${currentWorkspaceIndex}.ssh_private_key`,
          )}
        />

        <Tooltip label={t("workspaceSSHPrivateKeySelect")} openDelay={500}>
          <ActionIcon
            size="lg"
            onClick={selectSSHPrivateKey}
            style={{
              alignSelf: "end",
            }}
          >
            <IconKey style={actionIconStyle} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Fieldset>
  );
};

export default CurrentWorkspaceGroup;
