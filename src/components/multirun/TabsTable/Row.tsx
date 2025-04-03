import type { EventResponseTabsListPayloadSingleTab } from "@/events/payload.ts";
import { Checkbox, Table } from "@mantine/core";
import TabStateIcon from "@/components/TabStateIcon.tsx";
import { memo } from "react";

interface TabsTableRowProps {
  tab: EventResponseTabsListPayloadSingleTab;
  show: () => void;
  isSelected: boolean;
  setIsSelected: (state: boolean) => void;
  isCurrentActive: boolean;
}
const TabsTableRow = ({
  tab,
  show,
  isSelected,
  setIsSelected,
  isCurrentActive,
}: TabsTableRowProps) => (
  <Table.Tr
    onClick={show}
    style={{
      cursor: "pointer",
      backgroundColor: isCurrentActive ? "var(--table-hover-color)" : undefined,
    }}
  >
    <Table.Td>
      <Checkbox
        checked={isSelected}
        onChange={(ev) => setIsSelected(ev.currentTarget.checked)}
        color={tab.server.color}
      />
    </Table.Td>
    <Table.Td>{tab.server.name}</Table.Td>
    <Table.Td ta="center">
      <TabStateIcon state={tab.state} isNewMessage={tab.isNewMessage} />
    </Table.Td>
  </Table.Tr>
);

export default memo(TabsTableRow);
