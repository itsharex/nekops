import { memo } from "react";
import { Button, Flex, ScrollArea } from "@mantine/core";
import type {
  EventPayloadShellGridModify,
  EventPayloadShellTabsListResponse,
} from "@/events/payload.ts";

import TabsTable from "./TabsTable";
import {
  IconColumnInsertRight,
  IconLayoutGridRemove,
  IconRowInsertBottom,
} from "@tabler/icons-react";
import { emit } from "@tauri-apps/api/event";
import { EventNameShellGridModify } from "@/events/name.ts";
import { LayoutMaxCols, LayoutMaxRows } from "@/shell/layoutConfig.ts";

interface LayoutCenterProps {
  tabs: EventPayloadShellTabsListResponse;
  show: (nonce: string) => void;
  selectedTabsNonce: string[];
  setSelectedTabsNonce: (state: string[]) => void;
}
const LayoutCenter = ({
  tabs,
  show,
  selectedTabsNonce,
  setSelectedTabsNonce,
}: LayoutCenterProps) => (
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
        show={show}
        selectedTabsNonce={selectedTabsNonce}
        setSelectedTabsNonce={setSelectedTabsNonce}
      />
    </ScrollArea>

    <Flex direction="row" w="100%" gap="md" justify="center" align="center">
      <Button
        color="green"
        leftSection={<IconRowInsertBottom size={16} />}
        onClick={() =>
          emit<EventPayloadShellGridModify>(EventNameShellGridModify, {
            action: "add",
            grid: {
              row: 1,
              col: 0,
            },
          })
        }
        disabled={tabs.grid.row >= LayoutMaxRows}
      >
        Add Row
      </Button>
      <Button
        color="green"
        leftSection={<IconColumnInsertRight size={16} />}
        onClick={() =>
          emit<EventPayloadShellGridModify>(EventNameShellGridModify, {
            action: "add",
            grid: {
              row: 0,
              col: 1,
            },
          })
        }
        disabled={tabs.grid.col >= LayoutMaxCols}
      >
        Add Col
      </Button>
      <Button
        color="red"
        leftSection={<IconLayoutGridRemove size={16} />}
        onClick={() =>
          emit<EventPayloadShellGridModify>(EventNameShellGridModify, {
            action: "tidy",
          })
        }
        disabled={tabs.grid.row <= 1 && tabs.grid.col <= 1}
      >
        Tidy
      </Button>
    </Flex>
  </Flex>
);

export default memo(LayoutCenter);
