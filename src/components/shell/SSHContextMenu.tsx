import { Menu } from "@mantine/core";
import {
  IconArrowBounce,
  IconCode,
  IconFlare,
  IconMessageCircle,
  IconRocket,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import type { Server } from "@/types/server.ts";
import { menuIconStyle } from "@/common/actionStyles.ts";
import type { ShellClientType } from "@/types/shell.ts";

interface SSHContextMenuProps {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
  pos: {
    x: number;
    y: number;
  };

  jumpServers: Server[];

  onClickCopy: () => void;
  onClickStart: (clientType?: ShellClientType) => void;
  onClickJumpServer: (jumpServer: Server) => void;
}
const SSHContextMenu = ({
  isOpen,
  setIsOpen,
  pos,

  jumpServers,

  onClickCopy,
  onClickStart,
  onClickJumpServer,
}: SSHContextMenuProps) => {
  const { t } = useTranslation("main", { keyPrefix: "ssh" });

  return (
    <Menu opened={isOpen} onChange={setIsOpen} position="bottom-start">
      <Menu.Target>
        <div
          style={{
            left: pos.x,
            top: pos.y,
            position: "absolute",
          }}
        />
      </Menu.Target>
      <Menu.Dropdown>
        {/*<Menu.Label>{t("contextMenuConnectDirectly")}</Menu.Label>*/}
        <Menu.Item
          leftSection={<IconCode style={menuIconStyle} />}
          onClick={onClickCopy}
        >
          {t("contextMenuCopyCommand")}
        </Menu.Item>
        <Menu.Sub>
          <Menu.Sub.Target>
            <Menu.Sub.Item
              leftSection={<IconRocket style={menuIconStyle} />}
              onClick={() => onClickStart()}
              closeMenuOnClick={true}
            >
              {t("contextMenuStartSession")}
            </Menu.Sub.Item>
          </Menu.Sub.Target>

          <Menu.Sub.Dropdown>
            <Menu.Item
              leftSection={<IconFlare style={menuIconStyle} />}
              onClick={() => onClickStart("embedded")}
            >
              {t("contextMenuStartSession_embedded")}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconMessageCircle style={menuIconStyle} />}
              onClick={() => onClickStart("system")}
            >
              {t("contextMenuStartSession_system")}
            </Menu.Item>
          </Menu.Sub.Dropdown>
        </Menu.Sub>

        <Menu.Sub>
          <Menu.Sub.Target>
            <Menu.Sub.Item
              leftSection={<IconArrowBounce style={menuIconStyle} />}
            >
              {t("contextMenuConnectWithJumpServer")}
            </Menu.Sub.Item>
          </Menu.Sub.Target>

          <Menu.Sub.Dropdown>
            {jumpServers.length > 0 ? (
              jumpServers.map((js) => (
                <Menu.Item key={js.id} onClick={() => onClickJumpServer(js)}>
                  {js.name}
                </Menu.Item>
              ))
            ) : (
              <Menu.Item disabled>{t("contextMenuNoJumpServer")}</Menu.Item>
            )}
          </Menu.Sub.Dropdown>
        </Menu.Sub>
      </Menu.Dropdown>
    </Menu>
  );
};

export default SSHContextMenu;
