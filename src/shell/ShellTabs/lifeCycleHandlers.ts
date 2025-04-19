import type { Event } from "@tauri-apps/api/event";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import type { UseListStateHandlers } from "@mantine/hooks";

import type {
  EventPayloadShellNew,
  ShellSingleServer,
} from "@/events/payload.ts";
import type { TabState } from "@/types/tabState.ts";
import type {
  ShellGridBase,
  ShellGridTabLocation,
  ShellGridTabNonce,
} from "@/types/shell.ts";
import { startDummy } from "@/shell/startDummy.ts";
import { startEmbeddedSSH } from "@/shell/startEmbeddedSSH.ts";
import { startSystemSSH } from "@/shell/startSystemSSH.ts";
import type { TerminalInstance } from "@/shell/TerminalContext.tsx";

import { fallbackActive } from "./stateHandlers.ts";

export const newShell = (
  ev: Event<EventPayloadShellNew>,
  index: number,
  tabsDataHandlers: UseListStateHandlers<ShellSingleServer>,
  tabsStateHandlers: UseListStateHandlers<TabState>,
  tabsNewMessageHandlers: UseListStateHandlers<boolean>,
  tabsGridLocationCurrent: ShellGridTabLocation[],
  tabsGridLocationHandlers: UseListStateHandlers<ShellGridTabLocation>,
  setTerminalInstance: (
    nonce: string,
    instance: Partial<TerminalInstance>,
  ) => void,
  setActiveTab: (payload: ShellGridTabNonce) => void,
  setTerminateFunc: (nonce: string, func: (() => void) | null) => void,
  setShellState: (nonce: string, state: TabState) => void,
  stateUpdateOnNewMessage: (nonce: string) => void,
) => {
  for (const server of ev.payload.server) {
    tabsDataHandlers.setItem(index, server);
    tabsStateHandlers.setItem(index, "loading");
    tabsNewMessageHandlers.setItem(index, false);
    tabsGridLocationHandlers.setItem(index, {
      row: 0,
      col: 0,
      order: tabsGridLocationCurrent.filter((v) => v.row === 0 && v.col === 0)
        .length,
    });

    // Initialize terminal
    const terminal = new Terminal();
    const fitAddon = new FitAddon();

    // Store in context
    setTerminalInstance(server.nonce, {
      terminal,
      fitAddon,
      isLoading: true,
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
  setActiveTab({
    row: 0,
    col: 0,
    nonce: ev.payload.server[0].nonce,
  });
};

export const reconnectShell = (
  nonce: string,
  tabsDataCurrent: ShellSingleServer[],
  tabsDataHandlers: UseListStateHandlers<ShellSingleServer>,
  tabsStateHandlers: UseListStateHandlers<TabState>,
  tabsGridLocationCurrent: ShellGridTabLocation[],
  isActiveTab: (
    nonce: string,
    pos: ShellGridBase,
    current?: boolean,
  ) => boolean,
  setActiveTab: (payload: ShellGridTabNonce) => void,
) => {
  const index = tabsDataCurrent.findIndex((state) => state.nonce === nonce);
  if (index === -1) {
    // Invalid, it might already have been terminated
    console.warn("invalid nonce", nonce);
    return;
  }

  // Update with a different nonce (so it would be automatically restarted), using # split as counter
  const serverData = tabsDataCurrent[index];
  const splits = serverData.nonce.split("#");
  let counter = 2; // First reconnection is the 2nd connection
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
  if (isActiveTab(serverData.nonce, tabsGridLocationCurrent[index], true)) {
    setActiveTab({
      row: tabsGridLocationCurrent[index].row,
      col: tabsGridLocationCurrent[index].col,
      nonce: newNonce,
    });
  }
};

export const terminateShell = (
  nonce: string,
  removeTerminalInstance: (nonce: string) => void,
  tabsDataCurrent: ShellSingleServer[],
  tabsDataHandlers: UseListStateHandlers<ShellSingleServer>,
  tabsStateHandlers: UseListStateHandlers<TabState>,
  tabsNewMessageHandlers: UseListStateHandlers<boolean>,
  tabsGridLocationCurrent: ShellGridTabLocation[],
  tabsGridLocationHandlers: UseListStateHandlers<ShellGridTabLocation>,
  isActiveTab: (
    nonce: string,
    pos: ShellGridBase,
    current?: boolean,
  ) => boolean,
  setActiveTab: (payload: ShellGridTabNonce) => void,
) => {
  const index = tabsDataCurrent.findIndex((state) => state.nonce === nonce);
  if (index === -1) {
    // Invalid, it might already have been terminated
    console.warn("invalid nonce", nonce);
    return;
  }

  // Remove from the shell state context
  removeTerminalInstance(tabsDataCurrent[index].nonce);

  // console.log("do terminate", index);
  const pos = tabsGridLocationCurrent[index];
  if (isActiveTab(tabsDataCurrent[index].nonce, pos)) {
    fallbackActive(pos, tabsGridLocationCurrent, tabsDataCurrent, setActiveTab);
  }

  // Remove item
  tabsDataHandlers.remove(index);
  tabsStateHandlers.remove(index);
  tabsNewMessageHandlers.remove(index);

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
