import type { RescueSingleServer } from "@/events/payload.ts";
import type { TabState } from "@/types/tabState.ts";
import { Tabs } from "@mantine/core";
import RescueTerminal from "@/rescue/RescueTerminal.tsx";

interface RescuePanelProps {
  data: RescueSingleServer;
  setRescueState: (state: TabState) => void;
  setNewMessage: () => void;
  isActive: boolean;
}
const RescuePanel = ({
  data,
  setRescueState,
  setNewMessage,
}: RescuePanelProps) => (
  <Tabs.Panel value={data.nonce} h="100%">
    <RescueTerminal
      nonce={data.nonce}
      themeColor={data.color}
      server={data.access}
      serverName={data.name}
      setRescueState={setRescueState}
      setNewMessage={setNewMessage}
    />
  </Tabs.Panel>
);

export default RescuePanel;
