import { memo, useEffect, useState } from "react";
import { Flex, ScrollArea } from "@mantine/core";
import type { Event } from "@tauri-apps/api/event";
import { emit, listen } from "@tauri-apps/api/event";

import TabsTable from "./TabsTable";
import type { EventPayloadShellTabsListResponse } from "@/events/payload.ts";
import {
  EventNameShellSetActiveTabByNonce,
  EventNameShellTabsListRequest,
  EventNameShellTabsListResponse,
} from "@/events/name.ts";
import {
  LayoutMaxCols,
  LayoutMaxRows,
} from "@/shell/ShellTabs/layoutConfig.ts";
import LayoutControlButtons from "./LayoutControlButtons.tsx";

interface LayoutCenterProps {
  selectedTabsNonce: string[];
  setSelectedTabsNonce: (state: string[]) => void;
}
const LayoutCenter = ({
  selectedTabsNonce,
  setSelectedTabsNonce,
}: LayoutCenterProps) => {
  const [tabs, setTabs] = useState<EventPayloadShellTabsListResponse>({
    grid: { row: 0, col: 0 },
    tabs: [],
  });

  const setActivatedTabByNonce = (nonce: string) => {
    emit(EventNameShellSetActiveTabByNonce, nonce);
  };

  const requestTabsList = () => {
    emit(EventNameShellTabsListRequest);
  };

  const responseTabsListHandler = (
    ev: Event<EventPayloadShellTabsListResponse>,
  ) => {
    setTabs(ev.payload);
  };

  useEffect(() => {
    // Remove non-exist nonce when tabs change
    const allNonce = tabs.tabs.map((tab) => tab.server.nonce);
    const existSelectedNonce = selectedTabsNonce.filter((nonce) =>
      allNonce.includes(nonce),
    );
    if (existSelectedNonce.length !== selectedTabsNonce.length) {
      // Update selected
      setSelectedTabsNonce(existSelectedNonce);
    }
  }, [tabs]);

  useEffect(() => {
    // Prepare event listener for tabs update
    const stopShellTabsListResponseListener =
      listen<EventPayloadShellTabsListResponse>(
        EventNameShellTabsListResponse,
        responseTabsListHandler,
      );

    // Request for tabs list at startup
    requestTabsList();

    // Stop listen before component (page) destroy
    return () => {
      (async () => {
        (await stopShellTabsListResponseListener)();
      })();
    };
  }, []);

  return (
    <Flex direction="column" h="100%" gap="md">
      {/*Server Tabs*/}
      <ScrollArea
        h={0}
        style={{
          flexGrow: 1,
        }}
      >
        <TabsTable
          tabs={tabs}
          show={setActivatedTabByNonce}
          selectedTabsNonce={selectedTabsNonce}
          setSelectedTabsNonce={setSelectedTabsNonce}
        />
      </ScrollArea>

      <LayoutControlButtons
        isAddRowDisabled={tabs.grid.row >= LayoutMaxRows}
        isAddColDisabled={tabs.grid.col >= LayoutMaxCols}
        isTidyDisabled={tabs.grid.row <= 1 && tabs.grid.col <= 1}
      />
    </Flex>
  );
};

export default memo(LayoutCenter);
