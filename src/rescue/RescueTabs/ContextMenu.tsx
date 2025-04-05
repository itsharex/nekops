import { Code, Menu } from "@mantine/core";
import {
  IconCommand,
  IconLinkOff,
  IconPower,
  IconProgressBolt,
  IconRotate,
  IconRotateDot,
} from "@tabler/icons-react";
import { menuIconStyle } from "@/common/actionStyles.ts";

interface RescueTabContextMenuProps {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
  pos: {
    x: number;
    y: number;
  };

  onClickSendCtrlAltDel: () => void;
  onClickPowerCycleShutdown: () => void;
  onClickPowerCycleReset: () => void;
  onClickPowerCycleReboot: () => void;
  onClickTerminate: () => void;
  onClickReconnect: () => void;
}
const RescueTabContextMenu = ({
  isOpen,
  setIsOpen,
  pos,

  onClickSendCtrlAltDel,
  onClickPowerCycleShutdown,
  onClickPowerCycleReset,
  onClickPowerCycleReboot,
  onClickTerminate,
  onClickReconnect,
}: RescueTabContextMenuProps) => (
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
      <Menu.Label>Custom Input</Menu.Label>
      <Menu.Item
        leftSection={<IconCommand style={menuIconStyle} />}
        onClick={onClickSendCtrlAltDel}
      >
        Send <Code>Ctrl</Code>+<Code>Alt</Code>+<Code>Del</Code>
      </Menu.Item>

      <Menu.Divider />

      <Menu.Label>Power Cycle</Menu.Label>
      <Menu.Item
        leftSection={<IconPower style={menuIconStyle} />}
        onClick={onClickPowerCycleShutdown}
      >
        Shutdown
      </Menu.Item>
      <Menu.Item
        leftSection={<IconProgressBolt style={menuIconStyle} />}
        onClick={onClickPowerCycleReset}
      >
        Reset
      </Menu.Item>
      <Menu.Item
        leftSection={<IconRotateDot style={menuIconStyle} />}
        onClick={onClickPowerCycleReboot}
      >
        Reboot
      </Menu.Item>

      <Menu.Divider />

      <Menu.Label>Process Manage</Menu.Label>
      <Menu.Item
        leftSection={<IconLinkOff style={menuIconStyle} />}
        onClick={onClickTerminate}
        color="red"
      >
        Terminate
      </Menu.Item>
      <Menu.Item
        leftSection={<IconRotate style={menuIconStyle} />}
        onClick={onClickReconnect}
        color="yellow"
      >
        Reconnect
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);

export default RescueTabContextMenu;
