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
import { useThrottledCallback } from "@mantine/hooks";
import type { DraggableLocation } from "@hello-pangea/dnd";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { modals } from "@mantine/modals";

import { useTerminal } from "@/shell/TerminalContext.tsx";
import type { TabState } from "@/types/tabState.ts";
import {
  EventNameShellGridModify,
  EventNameShellNew,
  EventNameShellReadyRequest,
  EventNameShellReadyResponse,
  EventNameShellSelectAllByNonce,
  EventNameShellSetActiveTabByNonce,
  EventNameShellTabsListRequest,
  EventNameShellTabsListResponse,
  EventNameWindowCloseShell,
  EventNameWindowResizeShell,
} from "@/events/name.ts";
import type {
  EventPayloadShellGridModify,
  EventPayloadShellNew,
  EventPayloadShellTabsListResponse,
  ShellSingleServer,
} from "@/events/payload.ts";
import {
  ShellGridBase,
  ShellGridTabLocation,
  ShellGridTabNonce,
} from "@/types/shell.ts";
import { useRefListState } from "@/common/useRefListState.ts";
import { useRefState } from "@/common/useRefState.ts";

import ShellTabContextMenu from "./ContextMenu.tsx";
import ShellTab from "./Tab.tsx";
import ShellPanel from "./Panel.tsx";
import style from "./style.module.css";
import { LayoutColsWeight } from "./layoutConfig.ts";
import { DndZonePanel, DndZoneTabs } from "./dndConfig.ts";
import { gridModifyHandler } from "./gridModifyHandlers.ts";
import {
  newShell,
  reconnectShell,
  terminateShell,
} from "./lifeCycleHandlers.ts";
import { dndHandler } from "./dndHandler.ts";

const ShellTabs = () => {
  // Terminal context
  const { getTerminalInstance, setTerminalInstance, removeTerminalInstance } =
    useTerminal();

  // Window layout
  const [gridRows, setGridRows, gridRowsRef] = useRefState(1);
  const [gridCols, setGridCols, gridColsRef] = useRefState(1);

  // For components render & listen bindings
  const [tabsData, tabsDataHandlers, tabsDataRef] =
    useRefListState<ShellSingleServer>([]);
  const [tabsGridLocation, tabsGridLocationHandlers, tabsGridLocationRef] =
    useRefListState<ShellGridTabLocation>([]);
  const [tabsState, tabsStateHandlers, tabsStateRef] =
    useRefListState<TabState>([]);
  const [tabsNewMessage, tabsNewMessageHandlers, tabsNewMessageRef] =
    useRefListState<boolean>([]);

  const [activeTab, activeTabHandlers, activeTabRef] =
    useRefListState<ShellGridTabNonce>([
      {
        row: 0,
        col: 0,
        nonce: null,
      },
    ]);

  const setActiveTab = (payload: ShellGridTabNonce) => {
    activeTabHandlers.applyWhere(
      (v) => v.row === payload.row && v.col === payload.col,
      (_) => payload,
    );
  };

  // Response tabs data event (initialize / update)
  const responseTabsList = () => {
    const payload: EventPayloadShellTabsListResponse = {
      grid: {
        row: gridRowsRef.current,
        col: gridColsRef.current,
      },
      tabs: tabsDataRef.current.map((server, i) => ({
        server: {
          nonce: server.nonce,
          name: server.name,
          color: server.color,
        },
        state: tabsStateRef.current[i],
        isNewMessage: tabsNewMessageRef.current[i],
        gridLocation: tabsGridLocationRef.current[i],
        isActive: isActiveTab(
          server.nonce,
          tabsGridLocationRef.current[i],
          true,
        ),
      })),
    };
    emit(EventNameShellTabsListResponse, payload);
  };
  useEffect(responseTabsList, [
    tabsData,
    tabsState,
    tabsNewMessage,
    activeTab,
    tabsGridLocation,
    gridRows,
    gridCols,
  ]);

  // Helper function to set the terminate function
  const setTerminateFunc = (nonce: string, func: (() => void) | null) => {
    setTerminalInstance(nonce, { terminateFunc: func });
  };

  const stateUpdateOnNewMessage = (nonce: string) => {
    const { isLoading } = getTerminalInstance(nonce);
    if (isLoading) {
      setTerminalInstance(nonce, { isLoading: false });
      setShellState(nonce, "active");
    }
    setNewMessage(nonce);
  };

  const setShellState = (nonce: string, state: TabState) => {
    setTabShellState(state, nonce);
  };
  const setNewMessage = (nonce: string) => {
    setTabNewMessageState(nonce);
  };

  // Event listeners
  const shellNewHandler = (ev: Event<EventPayloadShellNew>) => {
    newShell(
      ev,
      tabsDataRef.current.length,
      tabsDataHandlers,
      tabsStateHandlers,
      tabsNewMessageHandlers,
      tabsGridLocationRef.current,
      tabsGridLocationHandlers,
      setTerminalInstance,
      setActiveTab,
      setTerminateFunc,
      setShellState,
      stateUpdateOnNewMessage,
    );
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
    setActiveTab({
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
  const doTerminate = (nonce: string) => {
    terminateShell(
      nonce,
      removeTerminalInstance,
      tabsDataRef.current,
      tabsDataHandlers,
      tabsStateHandlers,
      tabsNewMessageHandlers,
      tabsGridLocationRef.current,
      tabsGridLocationHandlers,
      isActiveTab,
      fallbackActive,
    );
  };

  const doReconnect = (nonce: string) => {
    reconnectShell(
      nonce,
      tabsDataRef.current,
      tabsDataHandlers,
      tabsStateHandlers,
      isActiveTab,
      setActiveTab,
      tabsGridLocationRef.current,
    );
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
            doTerminate(nonce);
          },
        });
      } else {
        doTerminate(nonce);
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
            doReconnect(nonce);
          },
        });
      } else {
        doReconnect(nonce);
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

  const setTabNewMessageState = (nonce: string) => {
    const index = tabsDataRef.current.findIndex(
      (state) => state.nonce === nonce,
    );

    if (!isActiveTab(nonce, tabsGridLocationRef.current[index], true)) {
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
    for (const { nonce } of tabsDataRef.current) {
      // Reversely
      doTerminate(nonce);
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

  const shellGridModifyHandler = (ev: Event<EventPayloadShellGridModify>) => {
    // console.log("Grid modify", ev.payload);
    gridModifyHandler(
      ev,
      gridRowsRef.current,
      gridColsRef.current,
      setGridRows,
      setGridCols,
      activeTabRef.current,
      activeTabHandlers,
      tabsGridLocationRef.current,
      tabsGridLocationHandlers,
      setActiveTab,
    );
    shellWindowResizeHandler();
  };

  const tabDragHandler = (
    nonce: string,
    source: DraggableLocation<string>,
    destination: DraggableLocation<string>,
  ) => {
    dndHandler(
      nonce,
      source,
      destination,
      tabsData,
      tabsGridLocation,
      tabsGridLocationHandlers,
      isActiveTab,
      fallbackActive,
      activeTab,
      setActiveTab,
    );

    // responseTabsList();
  };

  const isActiveTab = (
    nonce: string,
    pos: ShellGridBase,
    current: boolean = false,
  ) => {
    return (current ? activeTabRef.current : activeTab).some(
      (v) => v.row === pos.row && v.col === pos.col && v.nonce === nonce,
    );
  };

  const fallbackActive = (pos: ShellGridTabLocation) => {
    const tabsInSameGrid = tabsGridLocation
      .map((v, origIndex) => ({
        ...v,
        origIndex,
      }))
      .filter(
        (v) => v.row === pos.row && v.col === pos.col && v.order !== pos.order,
      );
    // console.log("fallbackActive", pos, tabsInSameGrid);
    if (tabsInSameGrid.length > pos.order + 1) {
      // Still has tab on right
      const nextOrderTab = tabsInSameGrid.find(
        (v) => v.order === pos.order + 1,
      );
      if (nextOrderTab) {
        setActiveTab({
          row: pos.row,
          col: pos.col,
          nonce: tabsData[nextOrderTab.origIndex].nonce,
        });
        clearTabNewMessageState(tabsData[nextOrderTab.origIndex].nonce);
      }
    } else if (tabsInSameGrid.length > 0) {
      // Still have tab
      tabsInSameGrid.sort((a, b) => b.order - a.order); // DESC
      setActiveTab({
        row: pos.row,
        col: pos.col,
        nonce: tabsData[tabsInSameGrid[0].origIndex].nonce,
      });
      clearTabNewMessageState(tabsData[tabsInSameGrid[0].origIndex].nonce);
    } else {
      // No remain tabs
      setActiveTab({
        row: pos.row,
        col: pos.col,
        nonce: null,
      });
    }
  };

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

    const stopShellGridModifyListener = listen(
      EventNameShellGridModify,
      shellGridModifyHandler,
    );

    return () => {
      (async () => {
        (await stopShellNewListener)();
        (await stopShellReadyListener)();
        (await stopShellSetActiveTabByNonceListener)();
        (await stopShellTabsListRequestListener)();
        (await stopWindowCloseShellListener)();
        (await stopWindowResizeShellListener)();
        (await stopShellGridModifyListener)();
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
    <>
      <Grid
        classNames={{
          root: style.gridRoot,
          inner: style.gridInner,
          col: style.gridCol,
        }}
        columns={LayoutColsWeight}
        gutter={0}
        // grow
      >
        <DragDropContext
          onDragEnd={({ destination, source, draggableId }) => {
            if (destination) {
              // console.log("dnd", draggableId, source, destination);
              tabDragHandler(draggableId, source, destination);
            }
          }}
        >
          {Array(gridRows)
            .fill(null)
            .map((_, rowIndex) =>
              Array(gridCols)
                .fill(null)
                .map((_, colIndex) => (
                  <Grid.Col
                    key={`grid-${rowIndex}-${colIndex}`}
                    span={LayoutColsWeight / gridCols}
                  >
                    <Tabs
                      variant="none"
                      className={style.tabs}
                      value={
                        activeTab.find(
                          (p) => p.row === rowIndex && p.col === colIndex,
                        )?.nonce
                      }
                      onChange={(newActive) => {
                        setActiveTab({
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
                      <Droppable
                        droppableId={`${DndZoneTabs}:${rowIndex}-${colIndex}`}
                        direction="horizontal"
                      >
                        {(provided) => (
                          <Tabs.List
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            <ScrollArea scrollbars="x" onWheel={scrollTabs}>
                              <Flex>
                                {tabsGridLocation
                                  .map((v, origIndex) => ({
                                    ...v,
                                    origIndex,
                                  }))
                                  .filter(
                                    (pos) =>
                                      pos.row === rowIndex &&
                                      pos.col === colIndex,
                                  )
                                  .toSorted((a, b) => a.order - b.order)
                                  .map(({ origIndex: index }, arrayIndex) => (
                                    <Draggable
                                      key={tabsData[index].nonce}
                                      draggableId={tabsData[index].nonce}
                                      index={arrayIndex}
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
                                              rightClickTab(
                                                ev,
                                                tabsData[index],
                                              );
                                            }}
                                            isActive={isActiveTab(
                                              tabsData[index].nonce,
                                              {
                                                row: rowIndex,
                                                col: colIndex,
                                              },
                                            )}
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

                      <Droppable
                        droppableId={`${DndZonePanel}:${rowIndex}-${colIndex}`}
                        isDropDisabled={gridRows <= 1 && gridCols <= 1}
                      >
                        {(provided, snapshot) => (
                          <Box
                            style={{
                              flexGrow: 1,
                              overflow: "clip",
                              height: 0,
                            }}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {/*DnD Dropzone*/}
                            <Box
                              pos="absolute"
                              w="100%"
                              h="100%"
                              top={0}
                              left={0}
                              bg="cyan"
                              opacity={snapshot.isDraggingOver ? 0.2 : 0}
                              style={{
                                pointerEvents: "none",
                                zIndex: 1,
                              }}
                            >
                              {provided.placeholder}
                            </Box>

                            {tabsGridLocation
                              .map((v, origIndex) => ({
                                ...v,
                                origIndex,
                              }))
                              .filter(
                                (pos) =>
                                  pos.row === rowIndex && pos.col === colIndex,
                              )
                              .map(({ origIndex: index }) => (
                                <ShellPanel
                                  key={tabsData[index].nonce}
                                  data={tabsData[index]}
                                  isActive={isActiveTab(tabsData[index].nonce, {
                                    row: rowIndex,
                                    col: colIndex,
                                  })}
                                />
                              ))}
                          </Box>
                        )}
                      </Droppable>
                    </Tabs>
                  </Grid.Col>
                )),
            )}
        </DragDropContext>
      </Grid>

      <ShellTabContextMenu
        isOpen={isContextMenuOpen}
        setIsOpen={setIsContextMenuOpen}
        pos={contextMenuPos}
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
    </>
  );
};

export default ShellTabs;
