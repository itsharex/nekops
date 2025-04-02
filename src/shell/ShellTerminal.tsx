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

interface ShellTerminalProps {
  nonce: string;
  themeColor: string;
  server: AccessRegular;
  jumpServer?: AccessRegular;
  setShellState: (state: ShellState) => void;
  setNewMessage: () => void;
}
const ShellTerminal = ({
  nonce,
  themeColor,
  server,
  jumpServer,
  setShellState,
  setNewMessage,
}: ShellTerminalProps) => {
  const terminalElementRef = useRef<HTMLDivElement | null>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);

  const terminateSSH = useRef<(() => void) | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const stateUpdateOnNewMessage = () => {
    if (isLoading) {
      setIsLoading(false);
      setShellState("active");
    }
    setNewMessage();
  };

  const setTerminateSSHFunc = (func: (() => void) | null) => {
    terminateSSH.current = func;
  };

  // Mount hooks
  useEffect(() => {
    if (terminalElementRef.current) {
      console.log("init", nonce);
      const terminal = new Terminal();
      const fitAddon = new FitAddon();

      // Bind instance ref
      terminalInstanceRef.current = terminal;

      // Apply size fit addon
      terminal.loadAddon(fitAddon);
      terminal.open(terminalElementRef.current);
      fitAddon.fit();

      // Hook window resize event
      const currentWindow = Window.getCurrent();
      const stopListenWindowResizeEvent = currentWindow.onResized(() => {
        fitAddon.fit();
      });

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

        // Close terminal
        fitAddon?.dispose();
        terminal?.dispose();
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
