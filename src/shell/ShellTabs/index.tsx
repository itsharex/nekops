import {
  Box,
  Flex,
  Grid,
  List,
  ScrollArea,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import type { Event } from "@tauri-apps/api/event";
import { emit, listen } from "@tauri-apps/api/event";
import type { MouseEvent, WheelEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Window } from "@tauri-apps/api/window";
import { useListState, useThrottledCallback } from "@mantine/hooks";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { modals } from "@mantine/modals";

import type { TabState } from "@/types/tabState.ts";
import {
  EventNameShellNew,
  EventNameShellReadyRequest,
  EventNameShellReadyResponse,
  EventNameShellSelectAllByNonce,
  EventNameShellSetActiveTabByNonce,
  EventNameShellSTTYFitByNonce,
  EventNameShellTabsListRequest,
  EventNameShellTabsListResponse,
  EventNameWindowCloseShell,
  EventNameWindowResizeShell,
} from "@/events/name.ts";
import type {
  EventPayloadShellNew,
  EventPayloadTabsListResponse,
  ShellSingleServer,
} from "@/events/payload.ts";
import type {
  GridPos,
  ShellGridActiveTab,
  ShellGridLocation,
} from "@/types/shell.ts";

import ShellTabContextMenu from "./ContextMenu.tsx";
import ShellTab from "./Tab.tsx";
import ShellPanel from "./Panel.tsx";
import style from "./style.module.css";

const ShellTabs = () => {
  // Window layout
  const [gridCols, setGridCols] = useState(2);
  const [gridRows, setGridRows] = useState(2);

  // For components render
  const [tabsData, tabsDataHandlers] = useListState<ShellSingleServer>([]);
  const [tabsGridLocation, tabsGridLocationHandlers] =
    useListState<ShellGridLocation>([]);
  const [tabsState, tabsStateHandlers] = useListState<TabState>([]);
  const [tabsNewMessage, tabsNewMessageHandlers] = useListState<boolean>([]);
  // For events binding
  const tabsDataRef = useRef<ShellSingleServer[]>([]);
  const tabsGridLocationRef = useRef<ShellGridLocation[]>([]);
  const tabsStateRef = useRef<TabState[]>([]);
  const tabsNewMessageRef = useRef<boolean[]>([]);
  // Bind state : setTabsData -> tabsData -> tabsDataRef
  useEffect(() => {
    tabsDataRef.current = tabsData;
  }, [tabsData]);
  useEffect(() => {
    tabsGridLocationRef.current = tabsGridLocation;
  }, [tabsGridLocationRef]);
  useEffect(() => {
    tabsStateRef.current = tabsState;
  }, [tabsState]);
  useEffect(() => {
    tabsNewMessageRef.current = tabsNewMessage;
  }, [tabsNewMessage]);

  const [currentActiveTab, currentActiveTabHandlers] =
    useListState<ShellGridActiveTab>([
      {
        row: 0,
        col: 0,
        nonce: null,
      },
    ]);
  const currentActiveTabRef = useRef<ShellGridActiveTab[]>([]);
  useEffect(() => {
    currentActiveTabRef.current = currentActiveTab;
  }, [currentActiveTab]);

  const setCurrentActiveTab = (payload: ShellGridActiveTab) => {
    const currentActiveTabIndex = currentActiveTabRef.current.findIndex(
      (p) => p.row === payload.row && p.col === payload.col,
    );
    if (currentActiveTabIndex === -1) {
      currentActiveTabHandlers.append(payload);
    } else {
      currentActiveTabHandlers.setItem(currentActiveTabIndex, payload);
    }
  };

  // Response tabs data event (initialize / update)
  const responseTabsList = () => {
    const payload: EventPayloadTabsListResponse = {
      tabs: tabsDataRef.current.map((server, i) => ({
        server: {
          nonce: server.nonce,
          name: server.name,
          color: server.color,
        },
        state: tabsStateRef.current[i],
        isNewMessage: tabsNewMessageRef.current[i],
        gridLocation: tabsGridLocationRef.current[i],
      })),
      currentActive: currentActiveTabRef.current,
    };
    emit(EventNameShellTabsListResponse, payload);
  };
  useEffect(responseTabsList, [
    tabsData,
    tabsState,
    tabsNewMessage,
    currentActiveTab,
  ]);

  // Event listeners
  const shellNewHandler = (ev: Event<EventPayloadShellNew>) => {
    for (const server of ev.payload.server) {
      tabsDataHandlers.append(server);
      tabsStateHandlers.append("loading");
      tabsNewMessageHandlers.append(false);
      tabsGridLocationHandlers.append({
        row: 0,
        col: 0,
        order: tabsGridLocationRef.current.filter(
          (v) => v.row === 0 && v.col === 0,
        ).length,
      });
      setCurrentActiveTab({
        row: 0,
        col: 0,
        nonce: server.nonce,
      });
    }
  };

  const shellSetActiveTabByNonceHandler = (ev: Event<string>) => {
    // Find index by nonce
    const serverIndex = tabsDataRef.current.findIndex(
      (server) => server.nonce === ev.payload,
    );
    if (serverIndex === -1) {
      console.warn("Invalid server");
      return;
    }

    // Get grid pos
    const gridPos = tabsGridLocationRef.current[serverIndex];

    // Set payload
    setCurrentActiveTab({
      row: gridPos.row,
      col: gridPos.col,
      nonce: ev.payload,
    });
    clearTabNewMessageState(ev.payload);
  };

  const shellTabsListRequestHandler = () => {
    responseTabsList();
  };

  // Close (terminate) confirm
  const doTerminate = (index: number) => {
    tabsDataHandlers.remove(index);
    tabsStateHandlers.remove(index);
    tabsNewMessageHandlers.remove(index);
    tabsGridLocationHandlers.remove(index);
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
    // setCurrentActiveTab(newNonce);
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

  const setTabShellState = (newState: TabState, nonce: string) => {
    const index = tabsDataRef.current.findIndex(
      (state) => state.nonce === nonce,
    );
    if (tabsStateRef.current[index] !== "terminated") {
      tabsStateHandlers.setItem(index, newState);
    }
  };

  const setTabNewMessageState = (nonce: string, pos: GridPos) => {
    const index = tabsDataRef.current.findIndex(
      (state) => state.nonce === nonce,
    );

    // Find current active tab by pos
    const currentActiveNonce = currentActiveTabRef.current.find(
      (v) => v.row === pos.row && v.col === pos.col,
    )?.nonce;
    if (currentActiveNonce !== tabsDataRef.current[index].nonce) {
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

  const shellWindowResizeHandler = () => {
    emit(EventNameWindowResizeShell);
  };
  const throttledWindowResizeHandler = useThrottledCallback(
    shellWindowResizeHandler,
    200,
  );

  // Scroll tabs: convert vertical scroll (default mouse behavior) to horizontal
  const scrollTabs = (ev: WheelEvent<HTMLDivElement>) => {
    if (ev.deltaY !== 0) {
      // console.log("scroll", ev.deltaY, ev.currentTarget);
      ev.currentTarget.firstElementChild?.scrollBy({
        left: ev.deltaY, // Convert vertical to horizontal, this is not an error
      });
    }
  };

  useEffect(() => {
    const stopShellReadyListener = listen<string>(
      EventNameShellReadyRequest,
      async (ev) => {
        await emit(EventNameShellReadyResponse, ev.payload);
      },
    );
    const stopShellNewListener = listen<EventPayloadShellNew>(
      EventNameShellNew,
      shellNewHandler,
    );
    const stopShellSetActiveTabByNonceListener = listen<string>(
      EventNameShellSetActiveTabByNonce,
      shellSetActiveTabByNonceHandler,
    );
    const stopShellTabsListRequestListener = listen(
      EventNameShellTabsListRequest,
      shellTabsListRequestHandler,
    );

    const stopWindowCloseShellListener = listen(
      EventNameWindowCloseShell,
      preCloseHandler,
    );

    const stopWindowResizeShellListener = Window.getCurrent().onResized(
      throttledWindowResizeHandler,
    );

    return () => {
      (async () => {
        (await stopShellReadyListener)();
      })();

      (async () => {
        (await stopShellNewListener)();
      })();

      (async () => {
        (await stopShellSetActiveTabByNonceListener)();
      })();

      (async () => {
        (await stopShellTabsListRequestListener)();
      })();

      (async () => {
        (await stopWindowCloseShellListener)();
      })();

      (async () => {
        (await stopWindowResizeShellListener)();
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

  const currentSelectedTab = useRef<ShellSingleServer | null>(null);
  const rightClickTab = (
    ev: MouseEvent<HTMLButtonElement>,
    server: ShellSingleServer,
  ) => {
    currentSelectedTab.current = server;
    setContextMenuPos({
      x: ev.clientX,
      y: ev.clientY,
    });
    setIsContextMenuOpen(true);
  };

  return (
    <Grid
      classNames={{
        root: style.gridRoot,
        inner: style.gridInner,
        col: style.gridCol,
      }}
      gutter={0}
      grow
    >
      {Array(gridRows)
        .fill(null)
        .map((_, rowIndex) =>
          Array(gridCols)
            .fill(null)
            .map((_, colIndex) => (
              <Grid.Col
                key={`section-${rowIndex}-${colIndex}`}
                span={Math.floor(12 / gridCols)}
              >
                <Tabs
                  className={style.tabs}
                  value={
                    currentActiveTab.find(
                      (p) => p.row === rowIndex && p.col === colIndex,
                    )?.nonce
                  }
                  onChange={(newActive) => {
                    setCurrentActiveTab({
                      row: rowIndex,
                      col: colIndex,
                      nonce: newActive,
                    });

                    if (newActive) {
                      clearTabNewMessageState(newActive);
                    }
                  }}
                  activateTabWithKeyboard={false}
                  onContextMenu={(ev) => ev.preventDefault()}
                >
                  <DragDropContext
                    onDragEnd={({ destination, source }) => {
                      if (destination) {
                        console.log("dnd", source, destination);
                        if (source.droppableId === destination.droppableId) {
                          // In same section
                        } else {
                          // Cross sections
                        }

                        // tabsDataHandlers.reorder(reorderOption);
                        // tabsStateHandlers.reorder(reorderOption);
                        // tabsNewMessageHandlers.reorder(reorderOption);
                      }
                    }}
                  >
                    <Droppable
                      droppableId={`shell-tabs:${rowIndex}-${colIndex}`}
                      direction="horizontal"
                    >
                      {(provided) => (
                        <Tabs.List
                          ref={provided.innerRef}
                          mih={42}
                          {...provided.droppableProps}
                        >
                          <ScrollArea scrollbars="x" onWheel={scrollTabs}>
                            <Flex>
                              {tabsGridLocation
                                .filter(
                                  (pos) =>
                                    pos.row === rowIndex &&
                                    pos.col === colIndex,
                                )
                                .toSorted((a, b) => a.order - b.order)
                                .map((_, index) => (
                                  <Draggable
                                    key={tabsData[index].nonce}
                                    draggableId={tabsData[index].nonce}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <div
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        ref={provided.innerRef}
                                      >
                                        <ShellTab
                                          data={tabsData[index]}
                                          close={() => {
                                            terminateByNonce(
                                              tabsData[index].nonce,
                                            );
                                          }}
                                          state={tabsState[index]}
                                          isNewMessage={tabsNewMessage[index]}
                                          onContextMenu={(ev) => {
                                            ev.preventDefault();
                                            rightClickTab(ev, tabsData[index]);
                                          }}
                                          isActive={
                                            currentActiveTab.findIndex(
                                              (v) =>
                                                v.row === rowIndex &&
                                                v.col === colIndex &&
                                                v.nonce ===
                                                  tabsData[index].nonce,
                                            ) !== -1
                                          }
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
                    {tabsData
                      .filter(
                        (_, index) =>
                          tabsGridLocation[index].row === rowIndex &&
                          tabsGridLocation[index].col === colIndex,
                      )
                      .map((tabData, index) => (
                        <ShellPanel
                          key={tabData.nonce}
                          data={tabData}
                          setShellState={(state) => {
                            setTabShellState(state, tabData.nonce);
                          }}
                          setNewMessage={() => {
                            setTabNewMessageState(tabData.nonce, {
                              row: rowIndex,
                              col: colIndex,
                            });
                          }}
                          isActive={
                            currentActiveTab.findIndex(
                              (v) =>
                                v.row === rowIndex &&
                                v.col === colIndex &&
                                v.nonce === tabsData[index].nonce,
                            ) !== -1
                          }
                        />
                      ))}
                  </Box>
                </Tabs>
              </Grid.Col>
            )),
        )}

      <ShellTabContextMenu
        isOpen={isContextMenuOpen}
        setIsOpen={setIsContextMenuOpen}
        pos={contextMenuPos}
        isEnableSTTYFit={
          currentSelectedTab.current?.clientOptions.type !== "embedded"
        }
        onClickSTTYFit={() => {
          if (currentSelectedTab.current) {
            emit(
              EventNameShellSTTYFitByNonce,
              currentSelectedTab.current.nonce,
            );
          }
        }}
        onClickSelectAll={() => {
          if (currentSelectedTab.current) {
            emit(
              EventNameShellSelectAllByNonce,
              currentSelectedTab.current.nonce,
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
    </Grid>
  );
};

export default ShellTabs;
