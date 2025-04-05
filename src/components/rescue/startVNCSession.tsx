import type { Server } from "@/types/server.ts";
import { openRescueWindow } from "@/utils/openWindow/rescue.ts";
import { emit, once } from "@tauri-apps/api/event";
import type { EventPayloadRescueNew } from "@/events/payload.ts";
import { notifications } from "@mantine/notifications";
import {
  EventNameRescueNew,
  EventNameRescueReadyRequest,
  EventNameRescueReadyResponse,
} from "@/events/name.ts";
import { randomString } from "@/utils/randomString.ts";
import {
  FailNotification,
  LoadingNotification,
  SuccessNotification,
} from "@/notifications/rescue.tsx";

export const startVNCSession = async (server: Server) => {
  // Create or open Rescue window
  await openRescueWindow();

  // Prepare checker
  let isReadyChecker: ReturnType<typeof setInterval> | null = null;

  // Set notification
  let loadingNotify: string | null = notifications.show(LoadingNotification);

  // Generate random nonce to prevent possible conflict, for both server and event
  const nonce = randomString(8);

  // Wait till window is ready
  const isReadyListenerStopFn = await once<string>(
    EventNameRescueReadyResponse,
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
      const newSSHEvent: EventPayloadRescueNew = {
        server: [
          {
            nonce,
            name: server.name,
            color: server.color,
            access: server.access.emergency,
          },
        ],
      };
      await emit(EventNameRescueNew, newSSHEvent);

      // Close listener
      isReadyListenerStopFn();
    },
  );

  // Start check interval
  isReadyChecker = setInterval(() => {
    emit(EventNameRescueReadyRequest, nonce);
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
