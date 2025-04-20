import { Tabs } from "@mantine/core";

import type { ShellSingleServer } from "@/events/payload.ts";
import ShellTerminal from "@/shell/ShellTerminal.tsx";

interface ShellPanelProps {
  data: ShellSingleServer;
  isActive: boolean;
}
const ShellPanel = ({ data, isActive }: ShellPanelProps) => (
  <Tabs.Panel value={data.nonce} h="100%">
    <ShellTerminal
      nonce={data.nonce}
      themeColor={data.color}
      backgroundImage={data.clientOptions.settings.background_image}
      isActive={isActive}
    />
  </Tabs.Panel>
);

export default ShellPanel;
