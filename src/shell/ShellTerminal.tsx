import { useEffect, useRef, useState } from "react";
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

  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonInstanceRef = useRef<FitAddon | null>(null);

  const terminateFunc = useRef<(() => void) | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const isPendingFit = useRef(false);

  const setTerminateSSHFunc = (func: (() => void) | null) => {
    terminateFunc.current = func;
  };

  // Use throttle to reduce resource consumption on re-rendering
  const throttledFit = useThrottledCallback(() => {
    if (isActive) {
      // Fit now
      fitAddonInstanceRef.current?.fit();
    } else if (!isPendingFit.current) {
      // Scheduled to fit later
      isPendingFit.current = true;
    }
  }, 200);

  const stateUpdateOnNewMessage = () => {
    if (isLoading) {
      setIsLoading(false);
      setShellState("active");
      throttledFit(); // Initialize fit
    }
    setNewMessage();
  };

  // Fit when become active
  useEffect(() => {
    if (isActive && isPendingFit.current) {
      fitAddonInstanceRef.current?.fit();
      isPendingFit.current = false;
    }
  }, [isActive]);

  // Mount hooks
  useEffect(() => {
    if (terminalElementRef.current) {
      // console.log("init", nonce); // debug log

      // Initialize terminal
      const terminal = new Terminal();
      const fitAddon = new FitAddon();

      // Bind instance ref
      terminalInstanceRef.current = terminal;
      fitAddonInstanceRef.current = fitAddon;

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
        startDummy(nonce, terminal, stateUpdateOnNewMessage, setShellState);
      } else {
        // Start normal server
        switch (clientOptions.type) {
          case "embedded":
            startEmbeddedSSH(
              terminal,
              stateUpdateOnNewMessage,
              setShellState,
              setTerminateSSHFunc,
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
              setTerminateSSHFunc,
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
        (async () => {
          (await stopWindowResizeEventListener)();
          (await stopSendCommandByNonceListener)();
          (await stopShellSelectAllByNonceListener)();
          (await stopShellSTTYFitByNonceListener)();
        })();

        // Terminate SSH
        if (terminateFunc.current !== null) {
          terminateFunc.current();
        }

        // Clear instance ref
        terminalInstanceRef.current = null;
        fitAddonInstanceRef.current = null;

        // Close terminal
        fitAddon?.dispose();
        terminal?.dispose();

        // console.log("terminate", nonce); // debug log
      };
    }
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
          opacity: isLoading ? 0 : 100,
        }}
        onContextMenu={(ev) => {
          ev.preventDefault();
          if (terminalInstanceRef.current) {
            copyOrPaste(terminalInstanceRef.current);
          }
        }}
      />
      <LoadingOverlay
        visible={isLoading}
        overlayProps={{ radius: "sm", blur: 2 }}
        onContextMenu={(ev) => {
          ev.preventDefault();
        }}
      />
    </div>
  );
};

export default ShellTerminal;
