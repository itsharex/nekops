import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import type { Event } from "@tauri-apps/api/event";
import { listen } from "@tauri-apps/api/event";
import { useThrottledCallback } from "@mantine/hooks";

import type { TabState } from "@/types/tabState.ts";
import { LoadingOverlay, rem } from "@mantine/core";
import type { AccessRegular } from "@/types/server.ts";
import { startDummy } from "@/shell/startDummy.ts";
import { startSystemSSH } from "@/shell/startSystemSSH.ts";
import type { ShellClientOptions } from "@/events/payload.ts";
import {
  EventNameShellSelectAllByNonce,
  EventNameWindowResizeShell,
} from "@/events/name.ts";
import { copyOrPaste } from "@/shell/copyOrPaste.tsx";
import { startEmbeddedSSH } from "@/shell/startEmbeddedSSH.ts";
import { useTerminal } from "@/shell/TerminalContext.tsx";

interface ShellTerminalProps {
  nonce: string;
  themeColor: string;
  server: AccessRegular;
  serverName: string;
  jumpServer?: AccessRegular;
  clientOptions: ShellClientOptions;
  setShellState: (state: TabState) => void;
  setNewMessage: () => void;
  isActive: boolean;
}
const ShellTerminal = ({
  nonce,
  themeColor,
  server,
  serverName,
  jumpServer,
  clientOptions,
  setShellState,
  setNewMessage,
  isActive,
}: ShellTerminalProps) => {
  const terminalElementRef = useRef<HTMLDivElement | null>(null);

  // Use the terminal context to get and set terminal instances
  const { getTerminalInstance, setTerminalInstance } = useTerminal();

  // Get the terminal instance for this nonce
  const instance = getTerminalInstance(nonce);

  // Helper function to set the terminate function
  const setTerminateFunc = (func: (() => void) | null) => {
    setTerminalInstance(nonce, { terminateFunc: func });
  };

  // Use throttle to reduce resource consumption on re-rendering
  const throttledFit = useThrottledCallback(() => {
    if (isActive) {
      // Fit now
      instance.fitAddon?.fit();
    } else if (!instance.isPendingFit) {
      // Scheduled to fit later
      setTerminalInstance(nonce, { isPendingFit: true });
    }
  }, 200);

  const stateUpdateOnNewMessage = () => {
    if (instance.isLoading) {
      setTerminalInstance(nonce, { isLoading: false });
      setShellState("active");
      throttledFit(); // Initialize fit
    }
    setNewMessage();
  };

  // Fit when become active
  useEffect(() => {
    if (isActive && instance.isPendingFit) {
      instance.fitAddon?.fit();
      setTerminalInstance(nonce, { isPendingFit: false });
    }
  }, [isActive, instance.isPendingFit, nonce]);

  // Mount hooks
  useEffect(() => {
    // Skip if the element ref is not set
    if (!terminalElementRef.current) {
      return;
    }

    // Check if we already have a terminal instance
    let currentTerminal: Terminal;
    if (instance.terminal) {
      // If we have an existing terminal, reattach it to the new DOM element
      // This happens when the terminal is dragged to a new grid

      // Reattach to the new element
      instance.terminal.open(terminalElementRef.current);

      currentTerminal = instance.terminal;
    } else {
      // console.log("init", nonce); // debug log

      // Initialize terminal
      const terminal = new Terminal();
      const fitAddon = new FitAddon();

      // Store in context
      setTerminalInstance(nonce, {
        terminal,
        fitAddon,
        isLoading: true,
        isPendingFit: false,
      });

      // Apply size fit addon
      terminal.loadAddon(fitAddon);

      // Initialize element
      terminal.open(terminalElementRef.current);

      if (
        server.user === "Candinya" &&
        server.address === "dummy" &&
        server.port === 0
      ) {
        // Start debug dummy server
        startDummy(
          nonce,
          terminal,
          stateUpdateOnNewMessage,
          setShellState,
          setTerminateFunc,
        );
      } else {
        // Start normal server
        switch (clientOptions.type) {
          case "embedded":
            startEmbeddedSSH(
              terminal,
              stateUpdateOnNewMessage,
              setShellState,
              setTerminateFunc,
              clientOptions,
              server,
              serverName,
              themeColor,
              jumpServer,
            );
            break;
          case "system":
            startSystemSSH(
              terminal,
              stateUpdateOnNewMessage,
              setShellState,
              setTerminateFunc,
              server,
              jumpServer,
            );
            break;
          default:
            console.warn("Unsupported client", clientOptions.type);
            break;
        }
      }

      currentTerminal = terminal;
    }

    // Hook window resize event
    const stopWindowResizeEventListener = listen(
      EventNameWindowResizeShell,
      throttledFit,
    );

    // Listen to multirun commands
    // const sendCommandByNonceHandler = (
    //   ev: Event<EventPayloadShellSendCommandByNonce>,
    // ) => {
    //   if (ev.payload.nonce.includes(nonce)) {
    //     currentTerminal.input(ev.payload.command, true); // This method is implemented from 5.4.0, which is also the version that breaks open function. So we can't process this event here until we upgrade to newer versions (if they fixed the open issue).
    //   }
    // };
    // const stopSendCommandByNonceListener =
    //   listen<EventPayloadShellSendCommandByNonce>(
    //     EventNameShellSendCommandByNonce,
    //     sendCommandByNonceHandler,
    //   );

    // Listen to select all event
    const shellSelectAllByNonceHandler = (ev: Event<string>) => {
      if (ev.payload === nonce) {
        currentTerminal.selectAll();
      }
    };
    const stopShellSelectAllByNonceListener = listen<string>(
      EventNameShellSelectAllByNonce,
      shellSelectAllByNonceHandler,
    );

    return () => {
      (async () => {
        (await stopWindowResizeEventListener)();
        // (await stopSendCommandByNonceListener)();
        (await stopShellSelectAllByNonceListener)();
      })();
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        borderLeftStyle: "solid",
        borderLeftWidth: rem(16),
        borderLeftColor: themeColor,
      }}
    >
      <div
        ref={terminalElementRef}
        style={{
          height: "100%",
          opacity: instance.isLoading ? 0 : 100,
        }}
        onContextMenu={(ev) => {
          ev.preventDefault();
          if (instance.terminal) {
            copyOrPaste(instance.terminal);
          }
        }}
      />
      <LoadingOverlay
        visible={instance.isLoading}
        overlayProps={{ radius: "sm", blur: 2 }}
        onContextMenu={(ev) => {
          ev.preventDefault();
        }}
      />
    </div>
  );
};

export default ShellTerminal;
