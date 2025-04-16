import { SimpleGrid } from "@mantine/core";
import { useState } from "react";
import { emit } from "@tauri-apps/api/event";
import { notifications } from "@mantine/notifications";

import { EventNameShellSendCommandByNonce } from "@/events/name.ts";
import type { EventPayloadShellSendCommandByNonce } from "@/events/payload.ts";

import LayoutCenter from "@/components/multirun/LayoutCenter";
import CommandCenter from "@/components/multirun/CommandCenter";

const MultirunPage = () => {
  const [selectedTabsNonce, setSelectedTabsNonce] = useState<string[]>([]);

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

  return (
    <>
      <SimpleGrid cols={2} h="100%" p="md">
        {/*Server Table*/}
        <LayoutCenter
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
