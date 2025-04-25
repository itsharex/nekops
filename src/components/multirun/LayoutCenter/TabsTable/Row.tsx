import type { ShellSingleTab } from "@/events/payload.ts";
import { Checkbox, Table } from "@mantine/core";
import TabStateIcon from "@/components/TabStateIcon.tsx";
import { memo } from "react";

interface TabsTableRowProps {
  tab: ShellSingleTab;
  show: () => void;
  isSelected: boolean;
  setIsSelected: (state: boolean) => void;
  isCurrentActive: boolean;
  isShowingGrid: boolean;
}
const TabsTableRow = ({
  tab,
  show,
  isSelected,
  setIsSelected,
  isCurrentActive,
  isShowingGrid,
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
    {isShowingGrid && (
      <Table.Td>
        {tab.gridLocation.row + 1} - {tab.gridLocation.col + 1}
      </Table.Td>
    )}
    <Table.Td>#{tab.gridLocation.order + 1}</Table.Td>
    <Table.Td ta="center">
      <TabStateIcon state={tab.state} isNewMessage={tab.isNewMessage} />
    </Table.Td>
  </Table.Tr>
);

export default memo(TabsTableRow);
