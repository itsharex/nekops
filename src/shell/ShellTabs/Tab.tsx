import type { ShellSingleServer } from "@/events/payload.ts";
import type { TabState } from "@/types/tabState.ts";
import type { MouseEvent } from "react";
import { useEffect, useRef } from "react";
import { ActionIcon, rem, Tabs } from "@mantine/core";
import TabStateIcon from "@/components/TabStateIcon.tsx";
import { IconX } from "@tabler/icons-react";
import Twemoji from "@/components/Twemoji";

interface ShellTabProps {
  data: ShellSingleServer;
  state?: TabState;
  isNewMessage?: boolean;
  close: () => void;
  onContextMenu: (ev: MouseEvent<HTMLButtonElement>) => void;
  isActive: boolean;
}
const ShellTab = ({
  data,
  state,
  isNewMessage,
  close,
  onContextMenu,
  isActive,
}: ShellTabProps) => {
  const tabElementRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (isActive) {
      tabElementRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isActive]);

  return (
    <Tabs.Tab
      ref={tabElementRef}
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
};

export default ShellTab;
