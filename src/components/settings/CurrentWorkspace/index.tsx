import {
  ActionIcon,
  Fieldset,
  Group,
  PasswordInput,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLock, IconLockOpen } from "@tabler/icons-react";
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
}: CurrentWorkspaceGroupProps) => (
  <Fieldset legend="Current Workspace">
    <Group>
      <PasswordInput
        label="Password"
        disabled={!isUnlocked}
        style={{
          flexGrow: 1,
        }}
        {...form.getInputProps("password")}
      />

      <Tooltip label="Unlock" openDelay={500}>
        <ActionIcon
          size="lg"
          color={isUnlocked ? "green" : "orange"}
          onClick={() => {
            if (isUnlocked) {
              notifications.show({
                color: "green",
                title: "You've already unlocked!",
                message: "Feel free to change password",
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

export default CurrentWorkspaceGroup;
