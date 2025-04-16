import { Checkbox, rem, Table } from "@mantine/core";
import { actionRowStyle } from "@/common/actionStyles.ts";
import { memo } from "react";

interface TabsTableHeadProps {
  selectedState: "all" | "partial" | "none";
  selectAll: (state: boolean) => void;
  isShowingGrid: boolean;
}
const TabsTableHead = ({
  selectedState,
  selectAll,
  isShowingGrid,
}: TabsTableHeadProps) => {
  return (
    <Table.Tr>
      <Table.Th style={{ width: rem(40) }}>
        <Checkbox
          checked={selectedState === "all"}
          indeterminate={selectedState === "partial"}
          onChange={(ev) => selectAll(ev.currentTarget.checked)}
        />
      </Table.Th>
      <Table.Th>Server Name</Table.Th>
      <Table.Th>{isShowingGrid ? "Grid Location" : "Order"}</Table.Th>
      <Table.Th style={actionRowStyle(1)}>State</Table.Th>
    </Table.Tr>
  );
};

export default memo(TabsTableHead);
