import { useEffect, useRef } from "react";
import type { Event } from "@tauri-apps/api/event";
import { listen } from "@tauri-apps/api/event";
import { useThrottledCallback } from "@mantine/hooks";
import { LoadingOverlay, rem } from "@mantine/core";
import {
  EventNameShellSelectAllByNonce,
  EventNameWindowResizeShell,
} from "@/events/name.ts";
import { copyOrPaste } from "@/shell/copyOrPaste.tsx";
import { useTerminal } from "@/shell/TerminalContext.tsx";

interface ShellTerminalProps {
  nonce: string;
  themeColor: string;
  isActive: boolean;
}
const ShellTerminal = ({ nonce, themeColor, isActive }: ShellTerminalProps) => {
  const terminalElementRef = useRef<HTMLDivElement | null>(null);
  const isPendingFit = useRef(false);

  // Use the terminal context to get and set terminal instances
  const { getTerminalInstance } = useTerminal();

  // Get the terminal instance for this nonce
  const instance = getTerminalInstance(nonce);

  // Use throttle to reduce resource consumption on re-rendering
  // This also provides a wrapper for state, so it won't be stuck
  // at the initial values when listen is called.
  // BTW, can we use the same idea for those useRefState
  // (wrap callback in useCallback or the `use-callback-ref.ts` of `Mantine`)
  // in the ShellTabs component?
  const throttledFit = useThrottledCallback(() => {
    if (isActive && !instance.isLoading) {
      // Fit now
      instance.fitAddon?.fit();
    } else if (!isPendingFit.current) {
      // Scheduled to fit later
      isPendingFit.current = true;
    }
  }, 200);

  // Fit when become active
  useEffect(() => {
    if (isActive && !instance.isLoading && isPendingFit.current) {
      // If we call fit just after mount, it will not work
      // (not sure whether this is related to the version of xterm.js).
      // So we need to wait for the next tick.
      // But safari doesn't support requestIdleCallback, so we have to use setTimeout here.
      // TODO: find a better way to fix this
      setTimeout(() => {
        instance.fitAddon?.fit();
        isPendingFit.current = false;
      }, 100);
    }
  }, [isActive, instance.isLoading]);

  // Mount hooks
  useEffect(() => {
    // Skip if the element ref is not set
    if (!terminalElementRef.current) {
      return;
    }

    // First, detach from the old element if it's still attached
    if (instance.terminal?.element) {
      // The terminal is attached to a different element, detach it
      instance.terminal.element.remove();
    }

    // Attach to the new element
    instance.terminal?.open(terminalElementRef.current);

    // Init fit
    throttledFit();

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
        instance.terminal?.selectAll();
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
