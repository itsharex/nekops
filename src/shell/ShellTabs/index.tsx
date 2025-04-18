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
import { MouseEvent, useEffect, useRef, useState, WheelEvent } from "react";
import { Window } from "@tauri-apps/api/window";
import { useThrottledCallback } from "@mantine/hooks";
import type { DraggableLocation } from "@hello-pangea/dnd";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { modals } from "@mantine/modals";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

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
import type {
  ShellGridBase,
  ShellGridTabLocation,
  ShellGridTabNonce,
} from "@/types/shell.ts";
import { useRefListState } from "@/common/useRefListState.ts";
import { useRefState } from "@/common/useRefState.ts";
import { startDummy } from "@/shell/startDummy.ts";
import { startSystemSSH } from "@/shell/startSystemSSH.ts";
import { startEmbeddedSSH } from "@/shell/startEmbeddedSSH.ts";

import ShellTabContextMenu from "./ContextMenu.tsx";
import ShellTab from "./Tab.tsx";
import ShellPanel from "./Panel.tsx";
import style from "./style.module.css";
import {
  LayoutColsWeight,
  LayoutMaxCols,
  LayoutMaxRows,
} from "./layoutConfig.ts";
import { DndZonePanel, DndZoneTabs } from "./dndConfig.ts";

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
    useRefListState<
      ShellGridTabLocation & {
        dataIndex: number;
      }
    >([]);
  const [tabsState, tabsStateHandlers, tabsStateRef] =
    useRefListState<TabState>([]);
  const [tabsNewMessage, tabsNewMessageHandlers, tabsNewMessageRef] =
    useRefListState<boolean>([]);

  const [currentActiveTab, currentActiveTabHandlers, currentActiveTabRef] =
    useRefListState<ShellGridTabNonce>([
      {
        row: 0,
        col: 0,
        nonce: null,
      },
    ]);

  const setCurrentActiveTab = (payload: ShellGridTabNonce) => {
    currentActiveTabHandlers.applyWhere(
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
        isActive:
          currentActiveTabRef.current.findIndex(
            (v) =>
              v.row === tabsGridLocationRef.current[i].row &&
              v.col === tabsGridLocationRef.current[i].col &&
              v.nonce === server.nonce,
          ) !== -1,
      })),
    };
    emit(EventNameShellTabsListResponse, payload);
  };
  useEffect(responseTabsList, [
    tabsData,
    tabsState,
    tabsNewMessage,
    currentActiveTab,
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
      setTerminalInstance(nonce, { isLoading: false, isPendingFit: true });
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
    for (const server of ev.payload.server) {
      const dataIndex = tabsDataRef.current.length;
      tabsDataHandlers.setItem(dataIndex, server);
      tabsStateHandlers.setItem(dataIndex, "loading");
      tabsNewMessageHandlers.setItem(dataIndex, false);
      tabsGridLocationHandlers.setItem(dataIndex, {
        row: 0,
        col: 0,
        order: tabsGridLocationRef.current.filter(
          (v) => v.row === 0 && v.col === 0,
        ).length,
        dataIndex,
      });

      // Initialize terminal
      const terminal = new Terminal();
      const fitAddon = new FitAddon();

      // Store in context
      setTerminalInstance(server.nonce, {
        terminal,
        fitAddon,
        isLoading: true,
        isPendingFit: false,
      });

      // Apply size fit addon
      terminal.loadAddon(fitAddon);

      if (
        server.access.user === "Candinya" &&
        server.access.address === "dummy" &&
        server.access.port === 0
      ) {
        // Start debug dummy server
        startDummy(
          server.nonce,
          terminal,
          () => stateUpdateOnNewMessage(server.nonce),
          (state) => setShellState(server.nonce, state),
          (func) => setTerminateFunc(server.nonce, func),
        );
      } else {
        // Start normal server
        switch (server.clientOptions.type) {
          case "embedded":
            startEmbeddedSSH(
              server.nonce,
              terminal,
              () => stateUpdateOnNewMessage(server.nonce),
              (state) => setShellState(server.nonce, state),
              (func) => setTerminateFunc(server.nonce, func),
              server.clientOptions,
              server.access,
              server.name,
              server.color,
              server.jumpServer,
            );
            break;
          case "system":
            startSystemSSH(
              server.nonce,
              terminal,
              () => stateUpdateOnNewMessage(server.nonce),
              (state) => setShellState(server.nonce, state),
              (func) => setTerminateFunc(server.nonce, func),
              server.access,
              server.jumpServer,
            );
            break;
          default:
            console.warn("Unsupported client", server.clientOptions.type);
            break;
        }
      }
    }

    // Set active tab
    setCurrentActiveTab({
      row: 0,
      col: 0,
      nonce: ev.payload.server[0].nonce,
    });
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
    // Remove from the shell state context
    removeTerminalInstance(tabsDataRef.current[index].nonce);

    // console.log("do terminate", index);
    const pos = tabsGridLocationRef.current[index];
    if (isActiveTab(tabsDataRef.current[index].nonce, pos)) {
      fallbackActive(pos);
    }

    // Remove item
    tabsDataHandlers.remove(index);
    tabsStateHandlers.remove(index);
    tabsNewMessageHandlers.remove(index);

    // Update reverse mapping of latter items
    tabsGridLocationHandlers.applyWhere(
      (v) => v.dataIndex > index,
      (v) => ({
        ...v,
        dataIndex: v.dataIndex - 1,
      }),
    );
    // Update order of latter tabs
    tabsGridLocationHandlers.applyWhere(
      (v) => v.row === pos.row && v.col === pos.col && v.order > pos.order,
      (v) => ({
        ...v,
        order: v.order - 1,
      }),
    );

    // Remove item
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
    if (
      isActiveTab(serverData.nonce, tabsGridLocationRef.current[index], true)
    ) {
      setCurrentActiveTab({
        row: tabsGridLocationRef.current[index].row,
        col: tabsGridLocationRef.current[index].col,
        nonce: newNonce,
      });
    }
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
    for (let i = tabsDataRef.current.length - 1; i >= 0; i--) {
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

  const tidyGrid = () => {
    // Tidy rows
    let rowsToShrink = 0;
    for (let i = gridRowsRef.current - 1; i >= 0; i--) {
      if (!tabsGridLocationRef.current.some((v) => v.row === i)) {
        rowsToShrink++;
        tabsGridLocationHandlers.applyWhere(
          (v) => v.row > i,
          (v) => ({
            ...v,
            row: v.row - 1,
          }),
        );
      }
    }
    if (rowsToShrink === gridRowsRef.current) {
      rowsToShrink--; // Keep last 1
    }

    // Tidy cols
    let colsToShrink = 0;
    for (let i = gridColsRef.current - 1; i >= 0; i--) {
      if (!tabsGridLocationRef.current.some((v) => v.col === i)) {
        colsToShrink++;
        tabsGridLocationHandlers.applyWhere(
          (v) => v.col > i,
          (v) => ({
            ...v,
            col: v.col - 1,
          }),
        );
      }
    }
    if (colsToShrink === gridColsRef.current) {
      colsToShrink--; // Keep last 1
    }

    // Check if need to shrink
    if (rowsToShrink > 0 || colsToShrink > 0) {
      // Adjust current active tabs
      const activeTabRecordsToAdjust = currentActiveTabRef.current.filter(
        (v) =>
          (v.row >= gridRowsRef.current - rowsToShrink ||
            v.col >= gridColsRef.current - colsToShrink) &&
          v.nonce !== null,
      );
      for (const record of activeTabRecordsToAdjust) {
        if (
          record.row >= gridRowsRef.current - rowsToShrink &&
          record.col >= gridColsRef.current - colsToShrink
        ) {
          setCurrentActiveTab({
            row: record.row - rowsToShrink,
            col: record.col - colsToShrink,
            nonce: record.nonce,
          });
        } else if (record.row >= gridRowsRef.current - rowsToShrink) {
          setCurrentActiveTab({
            row: record.row - rowsToShrink,
            col: record.col,
            nonce: record.nonce,
          });
        } else {
          // record.col >= gridColsRef.current - colsToShrink
          setCurrentActiveTab({
            row: record.row,
            col: record.col - colsToShrink,
            nonce: record.nonce,
          });
        }
      }

      // Set new size
      setGridRows(gridRowsRef.current - rowsToShrink);
      setGridCols(gridColsRef.current - colsToShrink);

      // Keep only in-field ones
      currentActiveTabHandlers.filter(
        (v) =>
          v.row < gridRowsRef.current - rowsToShrink &&
          v.col < gridColsRef.current - colsToShrink,
      );
    }
  };

  const expandGrid = (rows: number, cols: number) => {
    setGridRows(gridRowsRef.current + rows);
    setGridCols(gridColsRef.current + cols);

    // Expand active tabs
    const toAppendTabs: ShellGridTabNonce[] = [];
    // New rows old cols (bottom)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < gridColsRef.current; j++) {
        toAppendTabs.push({
          row: gridRowsRef.current + i,
          col: j,
          nonce: null, // Init
        });
      }
    }
    // New cols old rows (right)
    for (let j = 0; j < cols; j++) {
      for (let i = 0; i < gridRowsRef.current; i++) {
        toAppendTabs.push({
          row: i,
          col: gridColsRef.current + j,
          nonce: null, // Init
        });
      }
    }
    // New rows new cols (bottom-right)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        toAppendTabs.push({
          row: gridRowsRef.current + i,
          col: gridColsRef.current + j,
          nonce: null, // Init
        });
      }
    }
    currentActiveTabHandlers.append(...toAppendTabs);
  };

  const shellGridModifyHandler = (ev: Event<EventPayloadShellGridModify>) => {
    // console.log("Grid modify", ev.payload);
    switch (ev.payload.action) {
      case "add":
        let acceptedRows = ev.payload.grid.row;
        if (acceptedRows < 0) {
          acceptedRows = 0;
        } else if (gridRowsRef.current + acceptedRows > LayoutMaxRows) {
          acceptedRows = LayoutMaxRows - gridRowsRef.current;
        }
        let acceptedCols = ev.payload.grid.col;
        if (acceptedCols < 0) {
          acceptedCols = 0;
        } else if (gridColsRef.current + acceptedCols > LayoutMaxCols) {
          acceptedCols = LayoutMaxCols - gridColsRef.current;
        }
        if (acceptedRows > 0 || acceptedCols > 0) {
          expandGrid(acceptedRows, acceptedCols);
        }
        break;
      case "set":
        if (ev.payload.grid.row > 0 && ev.payload.grid.row < LayoutMaxRows) {
          setGridRows(ev.payload.grid.row);
        }
        if (ev.payload.grid.col > 0 && ev.payload.grid.col < LayoutMaxCols) {
          setGridCols(ev.payload.grid.col);
        }
        break;
      case "tidy":
        tidyGrid();
        break;
    }
    shellWindowResizeHandler();
  };

  const tabDragHandler = (
    nonce: string,
    source: DraggableLocation<string>,
    destination: DraggableLocation<string>,
  ) => {
    const tabIndex = tabsData.findIndex((t) => t.nonce === nonce);
    const tabLocation = tabsGridLocation[tabIndex];

    const sourceGrid = source.droppableId.split(":")[1];
    const [destZone, destGrid] = destination.droppableId.split(":");

    if (sourceGrid === destGrid) {
      // In same section
      if (destZone !== DndZonePanel) {
        if (source.index !== destination.index) {
          if (source.index > destination.index) {
            // Move forward
            tabsGridLocationHandlers.applyWhere(
              (v) =>
                v.row === tabLocation.row &&
                v.col === tabLocation.col &&
                v.order < source.index &&
                v.order >= destination.index,
              (v) => ({
                ...v,
                order: v.order + 1,
              }),
            );
          } else {
            // Move backward
            tabsGridLocationHandlers.applyWhere(
              (v) =>
                v.row === tabLocation.row &&
                v.col === tabLocation.col &&
                v.order > source.index &&
                v.order <= destination.index,
              (v) => ({
                ...v,
                order: v.order - 1,
              }),
            );
          }
          // Set new order
          tabsGridLocationHandlers.setItem(tabIndex, {
            ...tabLocation,
            order: destination.index,
          });
        }
      }
    } else {
      // Cross sections
      const destPos = destGrid.split("-");
      const destRow = parseInt(destPos[0]);
      const destCol = parseInt(destPos[1]);

      const isActive = isActiveTab(nonce, tabLocation);
      if (isActive) {
        fallbackActive(tabLocation);
      }

      // Move tabs in source
      tabsGridLocationHandlers.applyWhere(
        (v) =>
          v.row === tabLocation.row &&
          v.col === tabLocation.col &&
          v.order > tabLocation.order,
        (v) => ({
          ...v,
          order: v.order - 1,
        }),
      );

      // Move tabs in destination
      const destOrder =
        destZone === DndZoneTabs
          ? destination.index // Target index
          : tabsGridLocation.filter(
              (v) => v.row === destRow && v.col === destCol, // Place at last
            ).length;
      tabsGridLocationHandlers.applyWhere(
        (v) => v.row === destRow && v.col === destCol && v.order > destOrder,
        (v) => ({
          ...v,
          order: v.order + 1,
        }),
      );
      // Set new location
      tabsGridLocationHandlers.setItem(tabIndex, {
        row: destRow,
        col: destCol,
        order: destOrder,
        dataIndex: tabLocation.dataIndex, // Keep unchanged
      });

      // Keep active state
      if (
        isActive || // Tab is active
        !currentActiveTab.some(
          (v) => v.row === destRow && v.col === destCol && v.nonce !== null, // No active tab in new grid, set current as active one
        )
      ) {
        setCurrentActiveTab({
          row: destRow,
          col: destCol,
          nonce: nonce,
        });
      }
    }

    // responseTabsList();
  };

  const isActiveTab = (
    nonce: string,
    pos: ShellGridBase,
    current: boolean = false,
  ) => {
    return (current ? currentActiveTabRef.current : currentActiveTab).some(
      (v) => v.row === pos.row && v.col === pos.col && v.nonce === nonce,
    );
  };

  const fallbackActive = (pos: ShellGridTabLocation) => {
    const tabsInSameGrid = tabsGridLocation.filter(
      (v) => v.row === pos.row && v.col === pos.col && v.order !== pos.order,
    );
    // console.log("fallbackActive", pos, tabsInSameGrid);
    if (tabsInSameGrid.length > pos.order + 1) {
      // Still has tab on right
      const nextOrderTab = tabsInSameGrid.find(
        (v) => v.order === pos.order + 1,
      );
      if (nextOrderTab) {
        setCurrentActiveTab({
          row: pos.row,
          col: pos.col,
          nonce: tabsData[nextOrderTab.dataIndex].nonce,
        });
      }
    } else if (tabsInSameGrid.length > 0) {
      // Still have tab
      tabsInSameGrid.sort((a, b) => b.order - a.order); // DESC
      setCurrentActiveTab({
        row: pos.row,
        col: pos.col,
        nonce: tabsData[tabsInSameGrid[0].dataIndex].nonce,
      });
    } else {
      // No remain tabs
      setCurrentActiveTab({
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
                                  .filter(
                                    (pos) =>
                                      pos.row === rowIndex &&
                                      pos.col === colIndex,
                                  )
                                  .toSorted((a, b) => a.order - b.order)
                                  .map(({ dataIndex: index }, arrayIndex) => (
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
                              .filter(
                                (pos) =>
                                  pos.row === rowIndex && pos.col === colIndex,
                              )
                              .map(({ dataIndex: index }) => (
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
