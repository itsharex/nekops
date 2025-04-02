import {
  ActionIcon,
  Box,
  Flex,
  List,
  rem,
  ScrollArea,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import ShellTerminal from "@/shell/ShellTerminal.tsx";
import type { Event } from "@tauri-apps/api/event";
import { emit, listen } from "@tauri-apps/api/event";
import type { MouseEvent, WheelEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  EventNewSSHName,
  EventRequestSSHWindowReadyName,
  EventRequestTabsListName,
  EventResponseSSHWindowReadyName,
  EventResponseTabsListName,
  EventSetActiveTabByNonceName,
  EventShellWindowPreCloseName,
} from "@/events/name.ts";
import type {
  EventNewSSHPayload,
  EventResponseTabsListPayload,
  SSHSingleServer,
} from "@/events/payload.ts";
import { Window } from "@tauri-apps/api/window";
import type { ShellState } from "@/types/shellState.ts";
import { useListState } from "@mantine/hooks";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import TabStateIcon from "@/components/TabStateIcon.tsx";
import { modals } from "@mantine/modals";
import ShellTabContextMenu from "@/shell/ShellTabContextMenu.tsx";

interface ShellTabProps {
  data: SSHSingleServer;
  state?: ShellState;
  isNewMessage?: boolean;
  close: () => void;
  onContextMenu: (ev: MouseEvent<HTMLButtonElement>) => void;
}
const ShellTab = ({
  data,
  state,
  isNewMessage,
  close,
  onContextMenu,
}: ShellTabProps) => (
  <Tabs.Tab
    value={data.nonce}
    color={data.color}
    style={{
      borderBottomWidth: rem(4),
    }}
    leftSection={<TabStateIcon state={state} isNewMessage={isNewMessage} />}
    rightSection={
      <ActionIcon
        size="xs"
        variant="subtle"
        color={data.color}
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
      >
        <IconX />
      </ActionIcon>
    }
    component="div"
    // style={{
    //   backgroundColor: "var(--mantine-color-body)", // Conflict with the hover highlight
    // }}
    onContextMenu={onContextMenu}
  >
    {data.name}
  </Tabs.Tab>
);

interface ShellPanelProps {
  data: SSHSingleServer;
  setShellState: (state: ShellState) => void;
  setNewMessage: () => void;
}
const ShellPanel = ({
  data,
  setShellState,
  setNewMessage,
}: ShellPanelProps) => (
  <Tabs.Panel value={data.nonce} h="100%">
    <ShellTerminal
      nonce={data.nonce}
      themeColor={data.color}
      server={data.access}
      jumpServer={data.jumpServer}
      setShellState={setShellState}
      setNewMessage={setNewMessage}
    />
  </Tabs.Panel>
);

const ShellTabs = () => {
  // For components render
  const [tabsData, tabsDataHandlers] = useListState<SSHSingleServer>([]);
  const [tabsState, tabsStateHandlers] = useListState<ShellState>([]);
  const [tabsNewMessage, tabsNewMessageHandlers] = useListState<boolean>([]);
  // For events binding
  const tabsDataRef = useRef<SSHSingleServer[]>([]);
  const tabsStateRef = useRef<ShellState[]>([]);
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

  // Response tabs data event (initialize / update)
  const responseTabsList = () => {
    const payload: EventResponseTabsListPayload = {
      tabs: tabsDataRef.current.map((server, i) => ({
        server: {
          nonce: server.nonce,
          name: server.name,
          color: server.color,
        },
        state: tabsStateRef.current[i],
        isNewMessage: tabsNewMessageRef.current[i],
      })),
      currentActive: currentActiveTabRef.current,
    };
    emit(EventResponseTabsListName, payload);
  };
  useEffect(responseTabsList, [
    tabsData,
    tabsState,
    tabsNewMessage,
    currentActiveTab,
  ]);

  // Event listeners
  const newSSHEventListener = (ev: Event<EventNewSSHPayload>) => {
    for (const server of ev.payload.server) {
      tabsDataHandlers.append(server);
      tabsStateHandlers.append("loading");
      tabsNewMessageHandlers.append(false);
      setCurrentActiveTab(server.nonce);
    }
  };

  const setActiveTabByNonceListener = (ev: Event<string>) => {
    setCurrentActiveTab(ev.payload);
    clearTabNewMessageState(ev.payload);
  };

  const requestTabsListListener = () => {
    responseTabsList();
  };

  // Close (terminate) confirm
  const doClose = (index: number) => {
    tabsDataHandlers.remove(index);
    tabsStateHandlers.remove(index);
    tabsNewMessageHandlers.remove(index);
  };

  const closeTab = (nonce: string) => {
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
            doClose(index);
          },
        });
      } else {
        doClose(index);
      }
    }
  };

  const setTabShellState = (newState: ShellState, nonce: string) => {
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

  const preClose = (ev: Event<boolean>) => {
    if (ev.payload || !tabsStateRef.current.some((s) => s === "active")) {
      // Force terminate or no active remain
      terminateAllAndExit();
    } else {
      // Open close confirmation modal
      modals.openConfirmModal({
        title: "Terminate All",
        children: (
          <>
            <Text>These shells are still running...</Text>
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
      doClose(i);
    }
    requestIdleCallback(() => {
      // Destroy window
      Window.getCurrent().destroy();
    });
  };

  // Scroll tabs: convert vertical scroll (default mouse behavior) to horizontal
  const tabsScrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollTabs = (ev: WheelEvent<HTMLDivElement>) => {
    if (ev.deltaY !== 0 && !!tabsScrollerRef.current) {
      console.log("scroll", ev.deltaY);
      tabsScrollerRef.current.scrollBy({
        left: ev.deltaY, // Convert vertical to horizontal, this is not an error
      });
    }
  };

  useEffect(() => {
    const stopSSHWindowReadyPromise = listen<string>(
      EventRequestSSHWindowReadyName,
      async (ev) => {
        await emit(EventResponseSSHWindowReadyName, ev.payload);
      },
    );
    const stopSSHListenPromise = listen<EventNewSSHPayload>(
      EventNewSSHName,
      newSSHEventListener,
    );
    const stopSetActiveTabByNoncePromise = listen<string>(
      EventSetActiveTabByNonceName,
      setActiveTabByNonceListener,
    );
    const stopRequestTabsListPromise = listen(
      EventRequestTabsListName,
      requestTabsListListener,
    );

    const stopShellWindowPreClosePromise = listen(
      EventShellWindowPreCloseName,
      preClose,
    );

    return () => {
      (async () => {
        (await stopSSHWindowReadyPromise)();
        (await stopSSHListenPromise)();
        (await stopSetActiveTabByNoncePromise)();
        (await stopRequestTabsListPromise)();
        (await stopShellWindowPreClosePromise)();
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

  const currentSelectedTab = useRef<SSHSingleServer | null>(null);
  const rightClickTab = (
    ev: MouseEvent<HTMLButtonElement>,
    server: SSHSingleServer,
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
        pos="absolute"
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
          <Droppable droppableId="shell-tabs" direction="horizontal">
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
                            <ShellTab
                              data={tabData}
                              close={() => {
                                closeTab(tabData.nonce);
                              }}
                              state={tabsState[index]}
                              isNewMessage={tabsNewMessage[index]}
                              onContextMenu={(ev) => {
                                ev.preventDefault();
                                rightClickTab(ev, tabData);
                              }}
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
            <ShellPanel
              key={tabData.nonce}
              data={tabData}
              setShellState={(state) => {
                setTabShellState(state, tabData.nonce);
              }}
              setNewMessage={() => {
                setTabNewMessageState(tabData.nonce);
              }}
            />
          ))}
        </Box>
      </Tabs>

      <ShellTabContextMenu
        isOpen={isContextMenuOpen}
        setIsOpen={setIsContextMenuOpen}
        pos={contextMenuPos}
        onClickTerminate={() => {
          if (currentSelectedTab.current) {
            closeTab(currentSelectedTab.current.nonce);
          }
        }}
      />
    </>
  );
};

export default ShellTabs;
