import { Table } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import type { EventPayloadShellTabsListResponse } from "@/events/payload.ts";

import TabsTableHead from "./Head.tsx";
import TabsTableRow from "./Row.tsx";

interface TabsTableProps {
  tabs: EventPayloadShellTabsListResponse;
  show: (nonce: string) => void;
  selectedTabsNonce: string[];
  setSelectedTabsNonce: (state: string[]) => void;
}
const TabsTable = ({
  tabs,
  show,
  selectedTabsNonce,
  setSelectedTabsNonce,
}: TabsTableProps) => {
  const { t } = useTranslation("main", { keyPrefix: "multirun" });
  return (
    <Table
      stickyHeader
      stickyHeaderOffset={-1}
      highlightOnHover
      withTableBorder
    >
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
          isShowingGrid={tabs.grid.row > 1 || tabs.grid.col > 1}
        />
      </Table.Thead>
      <Table.Tbody>
        {tabs.tabs
          .toSorted(
            (a, b) =>
              a.gridLocation.row !== b.gridLocation.row // Order by row
                ? a.gridLocation.row - b.gridLocation.row
                : a.gridLocation.col !== b.gridLocation.col // Order by col
                  ? a.gridLocation.col - b.gridLocation.col
                  : a.gridLocation.order - b.gridLocation.order, // Order by order
          )
          .map((tab) => (
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
              isCurrentActive={tab.isActive}
              isShowingGrid={tabs.grid.row > 1 || tabs.grid.col > 1}
            />
          ))}
      </Table.Tbody>
      <Table.Caption>
        {tabs.tabs.length > 0
          ? t("serverTableCount", {
              count: tabs.tabs.length,
            })
          : t("serverTableEmpty")}
      </Table.Caption>
    </Table>
  );
};

export default memo(TabsTable);
