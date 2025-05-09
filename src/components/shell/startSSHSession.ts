import { emit, once } from "@tauri-apps/api/event";
import { notifications } from "@mantine/notifications";

import type {
  EventPayloadShellNew,
  ShellClientOptions,
} from "@/events/payload.ts";
import type { Server } from "@/types/server.ts";
import {
  EventNameShellNew,
  EventNameShellReadyRequest,
  EventNameShellReadyResponse,
} from "@/events/name.ts";
import { openShellWindow } from "@/utils/openWindow/shell.ts";
import { randomString } from "@/utils/randomString.ts";
import {
  FailNotification,
  LoadingNotification,
  SuccessNotification,
} from "@/notifications/shell.tsx";

export const startSSHSession = async (
  clientOptions: ShellClientOptions,
  server: Server,
  jumpServer?: Server,
) => {
  // Create or open Shell window
  await openShellWindow(clientOptions.settings.background_image);

  // Prepare checker
  let isReadyChecker: ReturnType<typeof setInterval> | null = null;

  // Set notification
  let loadingNotify: string | null = notifications.show(LoadingNotification);

  // Generate random nonce to prevent possible conflict, for both server and event
  const nonce = randomString(8);

  // Wait till window is ready
  const isReadyListenerStopFn = await once<string>(
    EventNameShellReadyResponse,
    async (ev) => {
      if (ev.payload !== nonce) {
        // Not for this session
        return;
      }

      // Stop checker
      if (isReadyChecker) {
        clearInterval(isReadyChecker);
      }

      // Update notification
      if (loadingNotify) {
        notifications.update({
          ...SuccessNotification,
          id: loadingNotify,
        });
        loadingNotify = null;
      }

      // Emit SSH event
      const newSSHEvent: EventPayloadShellNew = {
        server: [
          {
            nonce,
            name: server.name,
            color: server.color,
            access: server.access.regular,
            jumpServer: jumpServer ? jumpServer.access.regular : undefined,
            clientOptions,
          },
        ],
      };
      await emit(EventNameShellNew, newSSHEvent);

      // Close listener
      isReadyListenerStopFn();
    },
  );

  // Start check interval
  isReadyChecker = setInterval(() => {
    emit(EventNameShellReadyRequest, nonce);
  }, 200);

  // Set timeout notice
  setTimeout(() => {
    if (loadingNotify) {
      // Still loading
      notifications.update({
        ...FailNotification,
        id: loadingNotify,
      });
    }
  }, 10_000); // 10 seconds
};
