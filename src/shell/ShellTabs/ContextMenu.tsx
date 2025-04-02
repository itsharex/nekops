import { Menu } from "@mantine/core";
import { IconCopyPlus, IconLinkOff, IconRotate } from "@tabler/icons-react";
import { menuIconStyle } from "@/common/actionStyles.ts";

interface ShellTabContextMenuProps {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
  pos: {
    x: number;
    y: number;
  };

  onClickTerminate: () => void;
  onClickSelectAll: () => void;
  onClickReconnect: () => void;
}
const ShellTabContextMenu = ({
  isOpen,
  setIsOpen,
  pos,

  onClickTerminate,
  onClickSelectAll,
  onClickReconnect,
}: ShellTabContextMenuProps) => (
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
      <Menu.Label>Shell Action</Menu.Label>
      <Menu.Item
        leftSection={<IconLinkOff style={menuIconStyle} />}
        onClick={onClickTerminate}
      >
        Terminate
      </Menu.Item>
      <Menu.Item
        leftSection={<IconCopyPlus style={menuIconStyle} />}
        onClick={onClickSelectAll}
      >
        Select All
      </Menu.Item>
      <Menu.Item
        leftSection={<IconRotate style={menuIconStyle} />}
        onClick={onClickReconnect}
      >
        Reconnect
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);

export default ShellTabContextMenu;
