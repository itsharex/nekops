import { SimpleGrid } from "@mantine/core";
import { useEffect, useState } from "react";
import type { Event } from "@tauri-apps/api/event";
import { emit, listen } from "@tauri-apps/api/event";
import { notifications } from "@mantine/notifications";

import {
  EventNameShellSendCommandByNonce,
  EventNameShellSetActiveTabByNonce,
  EventNameShellTabsListRequest,
  EventNameShellTabsListResponse,
} from "@/events/name.ts";
import type {
  EventPayloadShellSendCommandByNonce,
  EventPayloadShellTabsListResponse,
} from "@/events/payload.ts";

import LayoutCenter from "@/components/multirun/LayoutCenter";
import CommandCenter from "@/components/multirun/CommandCenter";

const MultirunPage = () => {
  const [selectedTabsNonce, setSelectedTabsNonce] = useState<string[]>([]);
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

  const sendCommand = (command: string) => {
    const sendCommandEventPayload: EventPayloadShellSendCommandByNonce = {
      nonce: selectedTabsNonce,
      command: command,
    };
    emit(EventNameShellSendCommandByNonce, sendCommandEventPayload);
    notifications.show({
      color: "green",
      title: "Command sent!",
      message: "Feel free to view results in Shell window :D",
    });
  };

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
    <>
      <SimpleGrid cols={2} h="100%" p="md">
        {/*Server Table*/}
        <LayoutCenter
          tabs={tabs}
          show={setActivatedTabByNonce}
          selectedTabsNonce={selectedTabsNonce}
          setSelectedTabsNonce={setSelectedTabsNonce}
        />
        <CommandCenter
          isSendDisabled={selectedTabsNonce.length === 0}
          sendCommand={sendCommand}
        />
      </SimpleGrid>
    </>
  );
};

export default MultirunPage;
