import type { RescueSingleServer } from "@/events/payload.ts";
import type { TabState } from "@/types/tabState.ts";
import type { MouseEvent } from "react";
import { ActionIcon, rem, Tabs } from "@mantine/core";
import TabStateIcon from "@/components/TabStateIcon.tsx";
import { IconX } from "@tabler/icons-react";
import Twemoji from "@/components/Twemoji";

interface RescueTabProps {
  data: RescueSingleServer;
  state?: TabState;
  isNewMessage?: boolean;
  close: () => void;
  onContextMenu: (ev: MouseEvent<HTMLButtonElement>) => void;
}
const RescueTab = ({
  data,
  state,
  isNewMessage,
  close,
  onContextMenu,
}: RescueTabProps) => (
  <Tabs.Tab
    value={data.nonce}
    color={data.color}
    style={{
      borderBottomWidth: rem(4),
    }}
    leftSection={<TabStateIcon state={state} isNewMessage={isNewMessage} />}
    rightSection={
      <ActionIcon
        size="xs"
        variant="subtle"
        color={data.color}
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
      >
        <IconX />
      </ActionIcon>
    }
    component="div"
    // style={{
    //   backgroundColor: "var(--mantine-color-body)", // Conflict with the hover highlight
    // }}
    onContextMenu={onContextMenu}
  >
    <Twemoji content={data.name} />
  </Tabs.Tab>
);

export default RescueTab;
