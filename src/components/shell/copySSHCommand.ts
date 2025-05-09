import { notifications } from "@mantine/notifications";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

import type { Server } from "@/types/server.ts";
import {
  CopyFailNotification,
  CopySuccessNotification,
} from "@/notifications/shell.tsx";

export const copySSHCommand = async (server: Server, jumpServer?: Server) => {
  const command = ["ssh"];
  if (jumpServer) {
    command.push(
      "-J",
      `${jumpServer.access.regular.user || "root"}@${
        jumpServer.access.regular.address
      }` +
        (jumpServer.access.regular.port !== 22
          ? `:${jumpServer.access.regular.port}`
          : ""),
    );
  }
  if (server.access.regular.port !== 22) {
    command.push("-p", `${server.access.regular.port}`);
  }
  command.push(
    `${server.access.regular.user || "root"}@${server.access.regular.address}`,
  );
  try {
    await writeText(command.join(" "));
    notifications.show(CopySuccessNotification);
  } catch (e) {
    notifications.show(CopyFailNotification);
  }
};
