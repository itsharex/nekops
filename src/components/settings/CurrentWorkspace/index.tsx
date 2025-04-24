import {
  ActionIcon,
  Fieldset,
  Group,
  PasswordInput,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLock, IconLockOpen } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { actionIconStyle } from "@/common/actionStyles.ts";
import type { SettingsFormProps } from "@/components/settings/types.ts";

interface CurrentWorkspaceGroupProps extends SettingsFormProps {
  isUnlocked: boolean;
  openUnlockModal: () => void;
}
const CurrentWorkspaceGroup = ({
  form,
  isUnlocked,
  openUnlockModal,
}: CurrentWorkspaceGroupProps) => {
  const { t } = useTranslation("main", { keyPrefix: "settings" });

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
    </Fieldset>
  );
};

export default CurrentWorkspaceGroup;
