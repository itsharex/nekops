import { Box, Flex, List, ScrollArea, Tabs, Text, Title } from "@mantine/core";
import type { Event } from "@tauri-apps/api/event";
import { emit, listen } from "@tauri-apps/api/event";
import type { MouseEvent, WheelEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  EventNameRescueNew,
  EventNameRescuePowerCycleByNonce,
  EventNameRescueReadyRequest,
  EventNameRescueReadyResponse,
  EventNameRescueSendCtrlAltDelByNonce,
  EventNameWindowCloseRescue,
} from "@/events/name.ts";
import type {
  EventPayloadRescueNew,
  EventPayloadRescuePowerCycleByNonce,
  RescueSingleServer,
} from "@/events/payload.ts";
import { Window } from "@tauri-apps/api/window";
import type { TabState } from "@/types/tabState.ts";
import { useListState } from "@mantine/hooks";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { modals } from "@mantine/modals";

import RescueTabContextMenu from "./ContextMenu.tsx";
import RescueTab from "./Tab.tsx";
import RescuePanel from "./Panel.tsx";

const RescueTabs = () => {
  // For components render
  const [tabsData, tabsDataHandlers] = useListState<RescueSingleServer>([]);
  const [tabsState, tabsStateHandlers] = useListState<TabState>([]);
  const [tabsNewMessage, tabsNewMessageHandlers] = useListState<boolean>([]);
  // For events binding
  const tabsDataRef = useRef<RescueSingleServer[]>([]);
  const tabsStateRef = useRef<TabState[]>([]);
  const tabsNewMessageRef = useRef<boolean[]>([]);
  // Bind state : setTabsData -> tabsData -> tabsDataRef
  useEffect(() => {
    tabsDataRef.current = tabsData;
  }, [tabsData]);
  useEffect(() => {
    tabsStateRef.current = tabsState;
  }, [tabsState]);
  useEffect(() => {
    tabsNewMessageRef.current = tabsNewMessage;
  }, [tabsNewMessage]);

  const [currentActiveTab, setCurrentActiveTab] = useState<string | null>(null);
  const currentActiveTabRef = useRef<string | null>(null);
  useEffect(() => {
    currentActiveTabRef.current = currentActiveTab;
  }, [currentActiveTab]);

  // Event listeners
  const newSSHEventHandler = (ev: Event<EventPayloadRescueNew>) => {
    for (const server of ev.payload.server) {
      tabsDataHandlers.append(server);
      tabsStateHandlers.append("loading");
      tabsNewMessageHandlers.append(false);
      setCurrentActiveTab(server.nonce);
    }
  };

  // Close (terminate) confirm
  const doTerminate = (index: number) => {
    tabsDataHandlers.remove(index);
    tabsStateHandlers.remove(index);
    tabsNewMessageHandlers.remove(index);
  };

  const doReconnect = (index: number) => {
    // Update with a different nonce (so it would be automatically restarted), using # split as counter
    const serverData = tabsDataRef.current[index];
    const splits = serverData.nonce.split("#");
    let counter = 2; // First reconnect is the 2nd connect
    if (splits.length > 1) {
      counter = parseInt(splits[1]) + 1;
    }
    // Set with new nonce
    const newNonce = `${splits[0]}#${counter}`;
    tabsDataHandlers.setItem(index, {
      ...serverData,
      nonce: newNonce,
    });
    tabsStateHandlers.setItem(index, "loading");
    setCurrentActiveTab(newNonce);
  };

  const terminateByNonce = (nonce: string) => {
    const index = tabsDataRef.current.findIndex(
      (state) => state.nonce === nonce,
    );
    if (index != -1) {
      if (tabsStateRef.current[index] === "active") {
        modals.openConfirmModal({
          title: "Terminate confirmation",
          children: (
            <>
              <Text>Are you sure to terminate :</Text>
              <Title order={3} my="md" c="red">
                {tabsData[index].name}
              </Title>
            </>
          ),
          labels: { confirm: "Terminate", cancel: "Cancel" },
          confirmProps: { color: "red" },
          centered: true,
          onConfirm: () => {
            doTerminate(index);
          },
        });
      } else {
        doTerminate(index);
      }
    }
  };

  const reconnectByNonce = (nonce: string) => {
    const index = tabsDataRef.current.findIndex(
      (state) => state.nonce === nonce,
    );

    // Check current state
    if (index != -1) {
      if (tabsStateRef.current[index] === "active") {
        modals.openConfirmModal({
          title: "Reconnect confirmation",
          children: (
            <>
              <Text>Are you sure to reconnect :</Text>
              <Title order={3} my="md" c="red">
                {tabsData[index].name}
              </Title>
            </>
          ),
          labels: { confirm: "Reconnect", cancel: "Cancel" },
          confirmProps: { color: "red" },
          centered: true,
          onConfirm: () => {
            doReconnect(index);
          },
        });
      } else {
        doReconnect(index);
      }
    }
  };

  const setTabRescueState = (newState: TabState, nonce: string) => {
    const index = tabsDataRef.current.findIndex(
      (state) => state.nonce === nonce,
    );
    if (tabsStateRef.current[index] !== "terminated") {
      tabsStateHandlers.setItem(index, newState);
    }
  };

  const setTabNewMessageState = (nonce: string) => {
    const index = tabsDataRef.current.findIndex(
      (state) => state.nonce === nonce,
    );
    if (currentActiveTabRef.current !== tabsDataRef.current[index].nonce) {
      tabsNewMessageHandlers.setItem(index, true);
    }
  };

  const clearTabNewMessageState = (nonce: string) => {
    const index = tabsDataRef.current.findIndex(
      (state) => state.nonce === nonce,
    );
    if (index > -1 && tabsNewMessageRef.current[index]) {
      tabsNewMessageHandlers.setItem(index, false);
    }
  };

  const preCloseHandler = (ev: Event<boolean>) => {
    if (ev.payload || !tabsStateRef.current.some((s) => s === "active")) {
      // Force terminate or no active remain
      terminateAllAndExit();
    } else {
      // Open close confirmation modal
      modals.openConfirmModal({
        title: "Terminate All",
        children: (
          <>
            <Text>These rescue sessions are still running...</Text>
            <List my="md" ml="md">
              {tabsDataRef.current
                .filter((_, i) => tabsStateRef.current[i] === "active")
                .map((server) => (
                  <List.Item key={server.nonce} c={server.color}>
                    {server.name}
                  </List.Item>
                ))}
            </List>
            <Text>Are you sure to terminate them all?</Text>
          </>
        ),
        labels: { confirm: "Terminate", cancel: "Cancel" },
        confirmProps: { color: "red" },
        centered: true,
        onConfirm: terminateAllAndExit,
      });
    }
  };

  const terminateAllAndExit = () => {
    const len = tabsDataRef.current.length;
    for (let i = len - 1; i >= 0; i--) {
      // Reversely
      doTerminate(i);
    }

    // Destroy window
    if (typeof requestIdleCallback !== "undefined") {
      // Postpone destroy event to next tick so state can be updated
      requestIdleCallback(() => {
        Window.getCurrent().destroy();
      });
    } else {
      // Poor Safari, only you don't support this feature now :(
      setTimeout(() => {
        Window.getCurrent().destroy();
      }, 100);
    }
  };

  // Scroll tabs: convert vertical scroll (default mouse behavior) to horizontal
  const tabsScrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollTabs = (ev: WheelEvent<HTMLDivElement>) => {
    if (ev.deltaY !== 0 && !!tabsScrollerRef.current) {
      // console.log("scroll", ev.deltaY);
      tabsScrollerRef.current.scrollBy({
        left: ev.deltaY, // Convert vertical to horizontal, this is not an error
      });
    }
  };

  useEffect(() => {
    const stopRescueReadyListener = listen<string>(
      EventNameRescueReadyRequest,
      async (ev) => {
        await emit(EventNameRescueReadyResponse, ev.payload);
      },
    );
    const stopRescueNewListener = listen<EventPayloadRescueNew>(
      EventNameRescueNew,
      newSSHEventHandler,
    );

    const stopWindowCloseRescueListener = listen(
      EventNameWindowCloseRescue,
      preCloseHandler,
    );

    return () => {
      (async () => {
        (await stopRescueReadyListener)();
      })();

      (async () => {
        (await stopRescueNewListener)();
      })();

      (async () => {
        (await stopWindowCloseRescueListener)();
      })();
    };
  }, []);

  // Context menu
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const currentSelectedTab = useRef<RescueSingleServer | null>(null);
  const rightClickTab = (
    ev: MouseEvent<HTMLButtonElement>,
    server: RescueSingleServer,
  ) => {
    currentSelectedTab.current = server;
    setContextMenuPos({
      x: ev.clientX,
      y: ev.clientY,
    });
    setIsContextMenuOpen(true);
  };

  return (
    <>
      <Tabs
        // variant="unstyled"
        // classNames={classes}
        h="100%"
        w="100%"
        display="flex"
        pos="fixed"
        style={{
          flexDirection: "column",
        }}
        value={currentActiveTab}
        onChange={(newActive) => {
          setCurrentActiveTab(newActive);
          if (newActive) {
            clearTabNewMessageState(newActive);
          }
        }}
        activateTabWithKeyboard={false}
        onContextMenu={(ev) => ev.preventDefault()}
      >
        <DragDropContext
          onDragEnd={({ destination, source }) => {
            const reorderOption = {
              from: source.index,
              to: destination?.index || 0,
            };

            tabsDataHandlers.reorder(reorderOption);
            tabsStateHandlers.reorder(reorderOption);
            tabsNewMessageHandlers.reorder(reorderOption);
          }}
        >
          <Droppable droppableId="rescue-tabs" direction="horizontal">
            {(provided) => (
              <Tabs.List ref={provided.innerRef} {...provided.droppableProps}>
                <ScrollArea
                  viewportRef={tabsScrollerRef}
                  scrollbars="x"
                  onWheel={scrollTabs}
                >
                  <Flex>
                    {tabsData.map((tabData, index) => (
                      <Draggable
                        key={tabData.nonce}
                        draggableId={tabData.nonce}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
                            <RescueTab
                              data={tabData}
                              close={() => {
                                terminateByNonce(tabData.nonce);
                              }}
                              state={tabsState[index]}
                              isNewMessage={tabsNewMessage[index]}
                              onContextMenu={(ev) => {
                                ev.preventDefault();
                                rightClickTab(ev, tabData);
                              }}
                              isActive={currentActiveTab === tabData.nonce}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Flex>
                </ScrollArea>
              </Tabs.List>
            )}
          </Droppable>
        </DragDropContext>

        <Box
          style={{
            flexGrow: 1,
            overflow: "clip",
            height: 0,
          }}
        >
          {tabsData.map((tabData) => (
            <RescuePanel
              key={tabData.nonce}
              data={tabData}
              setRescueState={(state) => {
                setTabRescueState(state, tabData.nonce);
              }}
              setNewMessage={() => {
                setTabNewMessageState(tabData.nonce);
              }}
              isActive={currentActiveTab === tabData.nonce}
            />
          ))}
        </Box>
      </Tabs>

      <RescueTabContextMenu
        isOpen={isContextMenuOpen}
        setIsOpen={setIsContextMenuOpen}
        pos={contextMenuPos}
        onClickSendCtrlAltDel={() => {
          if (currentSelectedTab.current) {
            emit(
              EventNameRescueSendCtrlAltDelByNonce,
              currentSelectedTab.current.nonce,
            );
          }
        }}
        onClickPowerCycleShutdown={() => {
          if (currentSelectedTab.current) {
            emit<EventPayloadRescuePowerCycleByNonce>(
              EventNameRescuePowerCycleByNonce,
              {
                nonce: currentSelectedTab.current.nonce,
                action: "shutdown",
              },
            );
          }
        }}
        onClickPowerCycleReset={() => {
          if (currentSelectedTab.current) {
            emit<EventPayloadRescuePowerCycleByNonce>(
              EventNameRescuePowerCycleByNonce,
              {
                nonce: currentSelectedTab.current.nonce,
                action: "reset",
              },
            );
          }
        }}
        onClickPowerCycleReboot={() => {
          if (currentSelectedTab.current) {
            emit<EventPayloadRescuePowerCycleByNonce>(
              EventNameRescuePowerCycleByNonce,
              {
                nonce: currentSelectedTab.current.nonce,
                action: "reboot",
              },
            );
          }
        }}
        onClickTerminate={() => {
          if (currentSelectedTab.current) {
            terminateByNonce(currentSelectedTab.current.nonce);
          }
        }}
        onClickReconnect={() => {
          if (currentSelectedTab.current) {
            reconnectByNonce(currentSelectedTab.current.nonce);
          }
        }}
      />
    </>
  );
};

export default RescueTabs;
