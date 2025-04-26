import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import type { UseListStateHandlers } from "@mantine/hooks";

import type { ShellSingleServer } from "@/events/payload.ts";
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
  newServers: ShellSingleServer[],
  pos: ShellGridBase,
  startIndex: number,
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
  for (let i = 0; i < newServers.length; i++) {
    const server = newServers[i];
    const index = startIndex + i;

    tabsDataHandlers.setItem(index, server);
    tabsStateHandlers.setItem(index, "loading");
    tabsNewMessageHandlers.setItem(index, false);
    tabsGridLocationHandlers.setItem(index, {
      row: pos.row,
      col: pos.col,
      order: tabsGridLocationCurrent.filter(
        (v) => v.row === pos.row && v.col === pos.col,
      ).length,
    });

    // Initialize terminal
    const terminal = new Terminal(
      Object.assign(
        {
          fontSize: server.clientOptions.settings.font_size,
          theme: {
            background: server.clientOptions.settings.background_color,
            foreground: server.clientOptions.settings.foreground_color,
            cursor: server.color,
          },
          allowTransparency: true,
        },
        server.clientOptions.settings.font_family
          ? {
              fontFamily: server.clientOptions.settings.font_family,
            }
          : undefined,
      ),
    );
    const fitAddon = new FitAddon();

    // Store in context
    setTerminalInstance(server.nonce, {
      terminal,
      fitAddon,
      isLoading: true,
    });

    // Apply size fit addon
    terminal.loadAddon(fitAddon);

    // Listen to multirun commands
    // const sendCommandByNonceHandler = (
    //   ev: Event<EventPayloadShellSendCommandByNonce>,
    // ) => {
    //   if (ev.payload.nonce.includes(server.nonce)) {
    //     terminal.input(ev.payload.command, true); // This method is implemented from 5.4.0, which is also the version that breaks open function. So we can't process this event here until we upgrade to newer versions (if they fixed the open issue).
    //   }
    // };
    // const stopSendCommandByNonceListener =
    //   listen<EventPayloadShellSendCommandByNonce>(
    //     EventNameShellSendCommandByNonce,
    //     sendCommandByNonceHandler,
    //   );

    const shellSetTerminateFunc = (func: (() => void) | null) =>
      setTerminateFunc(server.nonce, () => {
        // Call generic terminate
        // (async () => {
        //   (await stopSendCommandByNonceListener)();
        // })();

        // Call specific terminate
        func?.();
      });

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
        shellSetTerminateFunc,
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
            shellSetTerminateFunc,
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
            shellSetTerminateFunc,
            server.clientOptions,
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
    row: pos.row,
    col: pos.col,
    nonce: newServers[0].nonce,
  });
};

export const buildReconnectNonce = (nonce: string) => {
  const splits = nonce.split("#");
  let counter = 2; // First reconnection is the 2nd connection
  if (splits.length > 1) {
    counter = parseInt(splits[1]) + 1;
  }
  // Set with new nonce
  return `${splits[0]}#${counter}`;
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
