import { Menu } from "@mantine/core";
import { IconLinkOff } from "@tabler/icons-react";
import { menuIconStyle } from "@/common/actionStyles.ts";

interface ShellTabContextMenuProps {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
  pos: {
    x: number;
    y: number;
  };

  onClickTerminate: () => void;
}
const ShellTabContextMenu = ({
  isOpen,
  setIsOpen,
  pos,

  onClickTerminate,
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
    </Menu.Dropdown>
  </Menu>
);

export default ShellTabContextMenu;
