import { useForm } from "@mantine/form";
import { Box, Button, ButtonGroup, Flex } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { useDisclosure } from "@mantine/hooks";

import type { SettingsState } from "@/types/settings.ts";
import { defaultWorkspace } from "@/types/settings.ts";
import { saveSettings } from "@/slices/settingsSlice.ts";
import type { AppDispatch, RootState } from "@/store.ts";
import {
  decryptServer,
  encryptServer,
  readEncryption,
  updatePassword,
} from "@/slices/encryptionSlice.ts";
import UnlockModal from "@/components/UnlockModal.tsx";
import {
  readServers,
  saveServers,
  updateServerByIndex,
} from "@/slices/serversSlice.ts";
import { readSnippets } from "@/slices/snippetsSlice.ts";

import type { SettingsExtended } from "@/components/settings/types.ts";
import WorkspaceGroup from "@/components/settings/Workspace";
import GlobalGroup from "@/components/settings/Global";
import CurrentWorkspaceGroup from "@/components/settings/CurrentWorkspace";
import CustomizeGroup from "@/components/settings/Customize";

const passwordUnchanged = "keep-unchanged";

const SettingsPage = () => {
  // Redux related
  const settings = useSelector((state: RootState) => state.settings);
  const encryption = useSelector((state: RootState) => state.encryption);
  const servers = useSelector((state: RootState) => state.servers);
  const dispatch = useDispatch<AppDispatch>();

  const form = useForm<SettingsExtended>({
    initialValues: {
      ...structuredClone(settings),
      password: encryption.isEncryptionEnabled ? passwordUnchanged : "",
    },
  });

  const save = async (newSettings: SettingsExtended) => {
    if (
      (encryption.isEncryptionEnabled || newSettings.password !== "") &&
      newSettings.password !== passwordUnchanged
    ) {
      // Set new password
      const newEncryptionState = await dispatch(
        updatePassword(newSettings.password ?? ""),
      ).unwrap();
      servers.map((server, index) => {
        dispatch(
          updateServerByIndex({
            index,
            server: encryptServer(
              newEncryptionState,
              decryptServer(encryption, server),
            ),
          }),
        );
      });
      dispatch(saveServers(servers.map((server) => server.id)));
    }
    // Select workspace
    if (newSettings.workspaces.length === 0) {
      newSettings.workspaces.push(defaultWorkspace);
    }
    const currentWorkspaceIndex = settings.workspaces.findIndex(
      (w) => w.id === settings.current_workspace.id,
    );
    const targetWorkspace =
      newSettings.workspaces[
        newSettings.workspaces.length > currentWorkspaceIndex
          ? currentWorkspaceIndex
          : 0 // No match, use first
      ];
    // Update settings
    const newSettingsState: SettingsState = {
      workspaces: newSettings.workspaces,
      current_workspace: targetWorkspace,
      default_ssh_action: newSettings.default_ssh_action,
      default_ssh_client: newSettings.default_ssh_client,
      customize: {
        font_family: newSettings.customize.font_family,
      },
    };
    await dispatch(saveSettings(newSettingsState)).unwrap();
    if (form.isDirty("workspaces")) {
      // Initialize workspace
      dispatch(readServers());
      dispatch(readSnippets());
      dispatch(readEncryption());
    }
    form.setInitialValues({
      ...newSettings,
      password: Boolean(newSettings.password) ? passwordUnchanged : "",
    });
    form.reset();
  };

  const [
    isUnlockModalOpen,
    { open: openUnlockModal, close: closeUnlockModal },
  ] = useDisclosure(false);

  return (
    <>
      <Box p="md">
        <form onSubmit={form.onSubmit(save)}>
          <Flex direction="column" gap="md">
            <GlobalGroup form={form} />

            <CustomizeGroup form={form} />

            <WorkspaceGroup form={form} />

            <CurrentWorkspaceGroup
              form={form}
              isUnlocked={encryption.isUnlocked}
              openUnlockModal={openUnlockModal}
            />
          </Flex>

          <ButtonGroup mt="lg">
            <Button type="submit" disabled={!form.isDirty()}>
              Save
            </Button>
          </ButtonGroup>
        </form>
      </Box>

      <UnlockModal
        isOpen={isUnlockModalOpen}
        close={closeUnlockModal}
        successMessage="Feel free to change password"
      />
    </>
  );
};

export default SettingsPage;
