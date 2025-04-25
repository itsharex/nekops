import { Menu } from "@mantine/core";
import { IconCode, IconRocket } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import type { Server } from "@/types/server.ts";
import { menuIconStyle } from "@/common/actionStyles.ts";

interface SSHContextMenuProps {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
  pos: {
    x: number;
    y: number;
  };

  jumpServers: Server[];

  onClickCopy: () => void;
  onClickStart: () => void;
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
        <Menu.Label>{t("contextMenuConnectDirectly")}</Menu.Label>
        <Menu.Item
          leftSection={<IconCode style={menuIconStyle} />}
          onClick={onClickCopy}
        >
          {t("contextMenuCopyCommand")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconRocket style={menuIconStyle} />}
          onClick={onClickStart}
        >
          {t("contextMenuStartSession")}
        </Menu.Item>
        {jumpServers.length > 0 && (
          <>
            <Menu.Divider />
            <Menu.Label>{t("contextMenuConnectWithJumpServer")}</Menu.Label>
            {jumpServers.map((js) => (
              <Menu.Item key={js.id} onClick={() => onClickJumpServer(js)}>
                {js.name}
              </Menu.Item>
            ))}
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default SSHContextMenu;
