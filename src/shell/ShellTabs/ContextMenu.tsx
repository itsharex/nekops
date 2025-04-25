import { Menu } from "@mantine/core";
import { IconCopyPlus, IconLinkOff, IconRotate } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { menuIconStyle } from "@/common/actionStyles.ts";

interface ShellTabContextMenuProps {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
  pos: {
    x: number;
    y: number;
  };

  onClickSelectAll: () => void;
  onClickTerminate: () => void;
  onClickReconnect: () => void;
}
const ShellTabContextMenu = ({
  isOpen,
  setIsOpen,
  pos,

  onClickSelectAll,
  onClickTerminate,
  onClickReconnect,
}: ShellTabContextMenuProps) => {
  const { t } = useTranslation("shell", { keyPrefix: "contextMenu" });

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
        <Menu.Label>{t("shellAction")}</Menu.Label>
        <Menu.Item
          leftSection={<IconCopyPlus style={menuIconStyle} />}
          onClick={onClickSelectAll}
        >
          {t("selectAll")}
        </Menu.Item>

        <Menu.Divider />

        <Menu.Label>{t("processManage")}</Menu.Label>
        <Menu.Item
          leftSection={<IconLinkOff style={menuIconStyle} />}
          onClick={onClickTerminate}
          color="red"
        >
          {t("terminate")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconRotate style={menuIconStyle} />}
          onClick={onClickReconnect}
          color="yellow"
        >
          {t("reconnect")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ShellTabContextMenu;
