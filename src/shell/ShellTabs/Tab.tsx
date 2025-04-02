import type { SSHSingleServer } from "@/events/payload.ts";
import type { ShellState } from "@/types/shellState.ts";
import type { MouseEvent } from "react";
import { ActionIcon, rem, Tabs } from "@mantine/core";
import TabStateIcon from "@/components/TabStateIcon.tsx";
import { IconX } from "@tabler/icons-react";

interface ShellTabProps {
  data: SSHSingleServer;
  state?: ShellState;
  isNewMessage?: boolean;
  close: () => void;
  onContextMenu: (ev: MouseEvent<HTMLButtonElement>) => void;
}
const ShellTab = ({
  data,
  state,
  isNewMessage,
  close,
  onContextMenu,
}: ShellTabProps) => (
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
    {data.name}
  </Tabs.Tab>
);

export default ShellTab;
