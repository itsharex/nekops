import { Table } from "@mantine/core";
import { memo } from "react";

import type { EventPayloadTabsListResponse } from "@/events/payload.ts";

import TabsTableHead from "./Head.tsx";
import TabsTableRow from "./Row.tsx";

interface TabsTableProps {
  tabs: EventPayloadTabsListResponse;
  show: (nonce: string) => void;
  selectedTabsNonce: string[];
  setSelectedTabsNonce: (state: string[]) => void;
}
const TabsTable = ({
  tabs,
  show,
  selectedTabsNonce,
  setSelectedTabsNonce,
}: TabsTableProps) => (
  <Table stickyHeader stickyHeaderOffset={-1} highlightOnHover withTableBorder>
    <Table.Thead
      style={{
        zIndex: 1,
      }}
    >
      <TabsTableHead
        selectAll={(state) => {
          if (state) {
            setSelectedTabsNonce(tabs.tabs.map((tab) => tab.server.nonce));
          } else {
            setSelectedTabsNonce([]);
          }
        }}
        selectedState={
          selectedTabsNonce.length === 0
            ? "none"
            : selectedTabsNonce.length === tabs.tabs.length
              ? "all"
              : "partial"
        }
      />
    </Table.Thead>
    <Table.Tbody>
      {tabs.tabs.map((tab) => (
        <TabsTableRow
          key={tab.server.nonce}
          tab={tab}
          show={() => show(tab.server.nonce)}
          isSelected={selectedTabsNonce.includes(tab.server.nonce)}
          setIsSelected={(state) => {
            if (state) {
              if (!selectedTabsNonce.includes(tab.server.nonce)) {
                setSelectedTabsNonce(
                  selectedTabsNonce.concat(tab.server.nonce),
                );
              }
            } else {
              const keyIndex = selectedTabsNonce.findIndex(
                (i) => i === tab.server.nonce,
              );
              if (keyIndex > -1) {
                setSelectedTabsNonce([
                  ...selectedTabsNonce.slice(0, keyIndex),
                  ...selectedTabsNonce.slice(keyIndex + 1),
                ]);
              }
            }
          }}
          isCurrentActive={tabs.currentActive === tab.server.nonce}
        />
      ))}
    </Table.Tbody>
    <Table.Caption>
      {tabs.tabs.length > 0
        ? `Total ${tabs.tabs.length} tabs.`
        : "Let's open a server tab!"}
    </Table.Caption>
  </Table>
);

export default memo(TabsTable);
