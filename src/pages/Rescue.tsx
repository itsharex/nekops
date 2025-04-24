import { Box, Flex, LoadingOverlay, Text } from "@mantine/core";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { open } from "@tauri-apps/plugin-shell";
import { IconLock } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import type { RootState } from "@/store.ts";
import SearchBar from "@/components/SearchBar.tsx";
import { searchServers } from "@/search/servers.ts";
import type { Server } from "@/types/server.ts";
import { decryptServer } from "@/slices/encryptionSlice.ts";
import UnlockModal from "@/components/UnlockModal.tsx";
import RescueModal from "@/components/rescue/RescueModal.tsx";
import ServerCardsVirtualScroll from "@/components/ServerCardsVirtualScroll";
import { startVNCSession } from "@/components/rescue/startVNCSession.tsx";

const RescuePage = () => {
  const { t } = useTranslation("main", { keyPrefix: "rescue" });

  const servers = useSelector((state: RootState) => state.servers);
  const encryption = useSelector((state: RootState) => state.encryption);

  const [
    isUnlockModalOpen,
    { open: openUnlockModal, close: closeUnlockModal },
  ] = useDisclosure(false);

  const [
    isRescueModalOpen,
    { open: openRescueModal, close: closeRescueModal },
  ] = useDisclosure(false);

  const [activeServer, setActiveServer] = useState<Server | null>(null);

  const startRescue = (server: Server) => {
    if (!encryption.isUnlocked) {
      // Do nothing
      return;
    }

    setActiveServer(decryptServer(encryption, server));
    openRescueModal();
  };

  const launchRescuePlatform = async () => {
    switch (activeServer?.access.emergency.method) {
      case "VNC":
        startVNCSession(t, activeServer);
        break;
      case "IPMI":
        try {
          await open(activeServer?.access.emergency.address);
        } catch (e: any) {
          notifications.show({
            color: "red",
            title: "Launch failed",
            message: e.message,
          });
        }
        break;
      default:
        notifications.show({
          color: "blue",
          title: "Launch rescue",
          message:
            "You may have to copy Address and handle it with correct tool.",
        });
        break;
    }
  };

  // Search related
  const [searchInput, setSearchInput] = useState("");

  return (
    <>
      <Flex
        direction="column"
        h="100%"
        pos="relative"
        style={{
          overflow: "hidden",
        }}
      >
        <Box p="md">
          <SearchBar
            placeholder="searchServers"
            setSearchInput={setSearchInput}
            isAutoFocus={encryption.isUnlocked} // Only get autofocus when unlocked
          />
        </Box>
        <LoadingOverlay
          visible={!encryption.isUnlocked}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{
            children: (
              <Flex direction="column" align="center" gap="sm">
                {/*<Loader type="bars" color={"orange"} />*/}
                <IconLock size={60} />
                <Text>{t("pendingUnlockNotice")}</Text>
              </Flex>
            ),
          }}
          zIndex={1}
          style={{
            cursor: "pointer",
          }}
          onClick={openUnlockModal}
        />
        <ServerCardsVirtualScroll
          servers={searchServers(searchInput, servers)}
          onClick={startRescue}
        />
      </Flex>

      <UnlockModal
        isOpen={isUnlockModalOpen}
        close={closeUnlockModal}
        successMessage={t("unlockSuccessMessage")}
      />

      <RescueModal
        isOpen={isRescueModalOpen}
        close={closeRescueModal}
        server={activeServer}
        launch={launchRescuePlatform}
      />
    </>
  );
};

export default RescuePage;
