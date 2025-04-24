import { Kbd, Menu } from "@mantine/core";
import {
  IconCommand,
  IconLinkOff,
  IconPower,
  IconProgressBolt,
  IconRotate,
  IconRotateDot,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

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
}: RescueTabContextMenuProps) => {
  const { t } = useTranslation("rescue", { keyPrefix: "contextMenu" });

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
        <Menu.Label>{t("customInput")}</Menu.Label>
        <Menu.Item
          leftSection={<IconCommand style={menuIconStyle} />}
          onClick={onClickSendCtrlAltDel}
        >
          {t("sendKeys")} <Kbd>Ctrl</Kbd>+<Kbd>Alt</Kbd>+<Kbd>Del</Kbd>
        </Menu.Item>

        <Menu.Divider />

        <Menu.Label>{t("powerCycle")}</Menu.Label>
        <Menu.Item
          leftSection={<IconPower style={menuIconStyle} />}
          onClick={onClickPowerCycleShutdown}
        >
          {t("shutdown")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconProgressBolt style={menuIconStyle} />}
          onClick={onClickPowerCycleReset}
        >
          {t("reset")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconRotateDot style={menuIconStyle} />}
          onClick={onClickPowerCycleReboot}
        >
          {t("reboot")}
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

export default RescueTabContextMenu;
