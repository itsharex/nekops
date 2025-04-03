import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { Window } from "@tauri-apps/api/window";
import type { ShellState } from "@/types/shellState.ts";
import { LoadingOverlay, rem } from "@mantine/core";
import type { AccessRegular } from "@/types/server.ts";
import { startDummy } from "@/shell/startDummy.ts";
import { startSSH } from "@/shell/startSSH.ts";
import type { EventSendCommandByNoncePayload } from "@/events/payload.ts";
import type { Event } from "@tauri-apps/api/event";
import { listen } from "@tauri-apps/api/event";
import {
  EventSendCommandByNonceName,
  EventShellSelectAllByNonceName,
} from "@/events/name.ts";
import { copyOrPaste } from "@/shell/copyOrPaste.tsx";
import { useThrottledCallback } from "@mantine/hooks";

interface ShellTerminalProps {
  nonce: string;
  themeColor: string;
  server: AccessRegular;
  jumpServer?: AccessRegular;
  setShellState: (state: ShellState) => void;
  setNewMessage: () => void;
  isActive: boolean;
}
const ShellTerminal = ({
  nonce,
  themeColor,
  server,
  jumpServer,
  setShellState,
  setNewMessage,
  isActive,
}: ShellTerminalProps) => {
  const terminalElementRef = useRef<HTMLDivElement | null>(null);

  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonInstanceRef = useRef<FitAddon | null>(null);

  const terminateSSH = useRef<(() => void) | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const isPendingFit = useRef(false);

  const stateUpdateOnNewMessage = () => {
    if (isLoading) {
      setIsLoading(false);
      setShellState("active");
      fitAddonInstanceRef.current?.fit(); // Initialize fit
    }
    setNewMessage();
  };

  const setTerminateSSHFunc = (func: (() => void) | null) => {
    terminateSSH.current = func;
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
      console.log("init", nonce); // debug log

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
      const currentWindow = Window.getCurrent();
      const stopListenWindowResizeEvent = currentWindow.onResized(throttledFit);

      if (
        server.user === "Candinya" &&
        server.address === "dummy" &&
        server.port === 0
      ) {
        // Start debug dummy server
        startDummy(nonce, terminal, setIsLoading, setShellState, setNewMessage);
      } else {
        // Start normal server
        startSSH(
          terminal,
          stateUpdateOnNewMessage,
          setShellState,
          setTerminateSSHFunc,
          server,
          jumpServer,
        );
      }

      // Listen to multirun commands
      const sendCommandByNonceListener = (
        ev: Event<EventSendCommandByNoncePayload>,
      ) => {
        if (ev.payload.nonce.includes(nonce)) {
          terminal.input(ev.payload.command);
        }
      };
      const stopSendCommandByNoncePromise =
        listen<EventSendCommandByNoncePayload>(
          EventSendCommandByNonceName,
          sendCommandByNonceListener,
        );

      // Listen to select all event
      const shellSelectAllByNonceListener = (ev: Event<string>) => {
        if (ev.payload === nonce) {
          terminal.selectAll();
        }
      };
      const stopShellSelectAllByNoncePromise = listen<string>(
        EventShellSelectAllByNonceName,
        shellSelectAllByNonceListener,
      );

      return () => {
        // Stop event listeners
        (async () => {
          (await stopSendCommandByNoncePromise)();
        })();

        // Stop window resize listener
        (async () => {
          (await stopListenWindowResizeEvent)();
        })();

        // Stop shell select all by nonce listener
        (async () => {
          (await stopShellSelectAllByNoncePromise)();
        })();

        // Terminate SSH
        if (terminateSSH.current !== null) {
          terminateSSH.current();
        }

        // Clear instance ref
        terminalInstanceRef.current = null;
        fitAddonInstanceRef.current = null;

        // Close terminal
        fitAddon?.dispose();
        terminal?.dispose();

        console.log("terminate", nonce); // debug log
      };
    }
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
      }}
    >
      <div
        ref={terminalElementRef}
        style={{
          height: "100%",
          opacity: isLoading ? 0 : 100,
          borderLeftStyle: "solid",
          borderLeftWidth: rem(16),
          borderLeftColor: themeColor,
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
