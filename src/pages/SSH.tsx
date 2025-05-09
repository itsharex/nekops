import { ActionIcon, Box, Flex, Tooltip } from "@mantine/core";
import { useSelector } from "react-redux";
import type { MouseEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { path } from "@tauri-apps/api";
import { useTranslation } from "react-i18next";
import { useDisclosure } from "@mantine/hooks";

import type { RootState } from "@/store.ts";
import SearchBar from "@/components/SearchBar.tsx";
import ServerCardsVirtualScroll from "@/components/ServerCardsVirtualScroll";
import SSHContextMenu from "@/components/shell/SSHContextMenu.tsx";
import { startSSHSession } from "@/components/shell/startSSHSession.ts";
import { copySSHCommand } from "@/components/shell/copySSHCommand.ts";
import { searchServers } from "@/search/servers.ts";
import type { Server } from "@/types/server.ts";
import { actionIconStyle } from "@/common/actionStyles.ts";
import { IconRocket } from "@tabler/icons-react";
import SSHTempLaunchModal from "@/components/shell/SSHTempLaunchModal.tsx";
import { ShellClientType } from "@/types/shell.ts";

const SSHPage = () => {
  const { t } = useTranslation("main", { keyPrefix: "ssh" });

  const servers = useSelector((state: RootState) => state.servers);
  const serversWithRegularAccess = useMemo(
    () => servers.filter((server) => Boolean(server.access.regular.address)),
    [servers],
  );
  const jumpServers = useMemo(
    () => servers.filter((server) => server.access.regular.is_jump_server),
    [servers],
  );
  const settings = useSelector((state: RootState) => state.settings);

  const [
    isTempLaunchModalOpen,
    { open: openTempLaunchModal, close: closeTempLaunchModal },
  ] = useDisclosure(false);

  const startSSH = async (
    server: Server,
    jumpServer?: Server,
    clientType?: ShellClientType,
  ) => {
    startSSHSession(
      {
        type: clientType || settings.default_ssh_client,
        workspaceKnownHostsFile: await path.join(
          settings.current_workspace.data_dir,
          "known_hosts",
        ),
        sshPrivateKey: settings.current_workspace.ssh_private_key,
        settings: settings.customize.shell,
      },
      server,
      jumpServer,
    );
  };

  const clickServerCard = (server: Server, jumpServer?: Server) => {
    switch (settings.default_ssh_action) {
      case "start":
        startSSH(server, jumpServer);
        break;
      case "copy":
      default:
        copySSHCommand(server, jumpServer);
        break;
    }
  };

  // Context menu
  const [sshContextMenuPos, setSSHContextMenuPos] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const [isSSHContextMenuOpen, setIsSSHContextMenuOpen] = useState(false);

  const currentSelectedServer = useRef<Server | null>(null);
  const rightClickServerCard = (
    ev: MouseEvent<HTMLDivElement>,
    server: Server,
  ) => {
    currentSelectedServer.current = server;
    setSSHContextMenuPos({
      x: ev.clientX,
      y: ev.clientY,
    });
    setIsSSHContextMenuOpen(true);
  };

  // Search related
  const [searchInput, setSearchInput] = useState("");

  return (
    <>
      <Flex
        direction="column"
        h="100%"
        style={{
          overflow: "hidden",
        }}
      >
        <Box p="md">
          <Flex direction="row" justify="space-between" gap="lg">
            <SearchBar
              placeholder="searchServers"
              setSearchInput={setSearchInput}
            />

            <Tooltip label={t("tempLaunch")} openDelay={500}>
              <ActionIcon
                size="lg"
                color="orange"
                onClick={openTempLaunchModal}
              >
                <IconRocket style={actionIconStyle} />
              </ActionIcon>
            </Tooltip>
          </Flex>
        </Box>
        <ServerCardsVirtualScroll
          servers={searchServers(searchInput, serversWithRegularAccess)}
          onClick={clickServerCard}
          onContextMenu={rightClickServerCard}
        />
      </Flex>

      <SSHContextMenu
        isOpen={isSSHContextMenuOpen}
        setIsOpen={setIsSSHContextMenuOpen}
        pos={sshContextMenuPos}
        jumpServers={jumpServers}
        onClickCopy={() => {
          if (currentSelectedServer.current) {
            copySSHCommand(currentSelectedServer.current);
          }
        }}
        onClickStart={(clientType) => {
          if (currentSelectedServer.current) {
            startSSH(currentSelectedServer.current, undefined, clientType);
          }
        }}
        onClickJumpServer={(jumpServer: Server) => {
          if (currentSelectedServer.current) {
            clickServerCard(currentSelectedServer.current, jumpServer);
          }
        }}
      />

      <SSHTempLaunchModal
        isOpen={isTempLaunchModalOpen}
        close={closeTempLaunchModal}
        launch={startSSH}
      />
    </>
  );
};

export default SSHPage;
