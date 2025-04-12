import { Tabs } from "@mantine/core";
import { memo } from "react";

import type { ShellSingleServer } from "@/events/payload.ts";
import type { TabState } from "@/types/tabState.ts";
import ShellTerminal from "@/shell/ShellTerminal.tsx";

interface ShellPanelProps {
  data: ShellSingleServer;
  setShellState: (state: TabState) => void;
  setNewMessage: () => void;
  isActive: boolean;
}
const ShellPanel = ({
  data,
  setShellState,
  setNewMessage,
  isActive,
}: ShellPanelProps) => (
  <Tabs.Panel value={data.nonce} h="100%">
    <ShellTerminal
      nonce={data.nonce}
      themeColor={data.color}
      clientOptions={data.clientOptions}
      server={data.access}
      serverName={data.name}
      jumpServer={data.jumpServer}
      setShellState={setShellState}
      setNewMessage={setNewMessage}
      isActive={isActive}
    />
  </Tabs.Panel>
);

export default memo(ShellPanel);
