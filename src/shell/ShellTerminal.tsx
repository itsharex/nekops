import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import type { Event } from "@tauri-apps/api/event";
import { listen } from "@tauri-apps/api/event";
import { useThrottledCallback } from "@mantine/hooks";

import type { TabState } from "@/types/tabState.ts";
import { LoadingOverlay, rem } from "@mantine/core";
import type { AccessRegular } from "@/types/server.ts";
import { startDummy } from "@/shell/startDummy.ts";
import { startSystemSSH } from "@/shell/startSystemSSH.ts";
import type {
  EventPayloadShellSendCommandByNonce,
  ShellClientOptions,
} from "@/events/payload.ts";
import {
  EventNameShellSelectAllByNonce,
  EventNameShellSendCommandByNonce,
  EventNameShellSTTYFitByNonce,
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
  const { getTerminalInstance, setTerminalInstance, removeTerminalInstance } =
    useTerminal();

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
    if (instance.terminal) {
      // If we have an existing terminal, reattach it to the new DOM element
      // This happens when the terminal is dragged to a new grid

      // First, detach from the old element if it's still attached
      // const oldElement = instance.terminal.element?.parentElement;
      // if (oldElement && oldElement !== terminalElementRef.current) {
      //   // The terminal is attached to a different element, detach it
      //   instance.terminal.element?.remove();
      //   console.log("boo");
      // }

      // Reattach to the new element
      instance.terminal.open(terminalElementRef.current);
      console.log("foo", terminalElementRef.current);

      // Ensure the terminal is visible by setting isLoading to false
      // setTerminalInstance(nonce, { isLoading: false });

      // Always fit the terminal to the new container to ensure it's properly sized
      instance.fitAddon?.fit();

      // Schedule another fit after a short delay to ensure the terminal is properly sized
      // This helps with cases where the terminal might not be fully rendered yet
      // setTimeout(() => {
      //   if (instance.fitAddon) {
      //     instance.fitAddon.fit();
      //   }
      // }, 100);

      return;
    }

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

    // Hook window resize event
    const stopWindowResizeEventListener = listen(
      EventNameWindowResizeShell,
      throttledFit,
    );

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

    // Listen to multirun commands
    const sendCommandByNonceHandler = (
      ev: Event<EventPayloadShellSendCommandByNonce>,
    ) => {
      if (ev.payload.nonce.includes(nonce)) {
        terminal.input(ev.payload.command);
      }
    };
    const stopSendCommandByNonceListener =
      listen<EventPayloadShellSendCommandByNonce>(
        EventNameShellSendCommandByNonce,
        sendCommandByNonceHandler,
      );

    // Listen to select all event
    const shellSelectAllByNonceHandler = (ev: Event<string>) => {
      if (ev.payload === nonce) {
        terminal.selectAll();
      }
    };
    const stopShellSelectAllByNonceListener = listen<string>(
      EventNameShellSelectAllByNonce,
      shellSelectAllByNonceHandler,
    );

    const shellSTTYFitByNonceHandler = (ev: Event<string>) => {
      if (ev.payload === nonce) {
        terminal.input(
          `stty columns ${terminal.cols} rows ${terminal.rows}\n`,
          false,
        );
      }
    };
    const stopShellSTTYFitByNonceListener = listen<string>(
      EventNameShellSTTYFitByNonce,
      shellSTTYFitByNonceHandler,
    );

    return () => {
      // Only clean up if this is the last instance of this terminal
      // This prevents cleanup when the component is just being moved to a different location
      const currentInstance = getTerminalInstance(nonce);
      if (currentInstance.terminal === terminal) {
        // Check if we're just moving the terminal or actually terminating it
        // If we're in a React StrictMode development environment or the component is being
        // remounted due to parent component changes, we don't want to terminate the SSH session
        const isJustMoving = document.contains(terminalElementRef.current);

        if (!isJustMoving) {
          (async () => {
            (await stopWindowResizeEventListener)();
            (await stopSendCommandByNonceListener)();
            (await stopShellSelectAllByNonceListener)();
            (await stopShellSTTYFitByNonceListener)();
          })();

          // Only terminate SSH if we're actually removing the terminal from the DOM
          if (currentInstance.terminateFunc) {
            currentInstance.terminateFunc();
          }

          // Close terminal
          fitAddon?.dispose();
          terminal?.dispose();

          // Remove from context
          removeTerminalInstance(nonce);

          console.log("terminate", nonce); // debug log
        }
      }
    };
  }, [nonce, instance.terminal]);

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
