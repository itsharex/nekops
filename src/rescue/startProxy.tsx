// import type { TabState } from "@/types/tabState.ts";
import { Command } from "@tauri-apps/plugin-shell";

import i18next from "@/i18n/loaders/rescue.ts";

export const startProxy = (
  reportProxyError: (status: string, message: string) => void,
  // setRescueState: (newState: TabState) => void,
  setTerminateFunc: (func: (() => void) | null) => void,
  vncAddress: string,
) =>
  new Promise<string>((resolve, reject) => {
    let isTerminated = false;

    // Start proxy

    const proxyCommand = Command.sidecar("embedded/bin/websockify", [
      "-t",
      vncAddress,
    ]);

    // Mount event listeners
    proxyCommand.on("close", (data) => {
      // setRescueState("terminated");
      if (!isTerminated) {
        reportProxyError(
          "exited",
          i18next.t("proxyEvents.exit", {
            code: data.code,
          }),
        );
        isTerminated = true;
      }

      // Invalidate terminate func
      setTerminateFunc(null);
    });
    proxyCommand.on("error", (data) => {
      reportProxyError("error", data);
    });
    proxyCommand.stderr.on("data", (data) => {
      reportProxyError("stderr", data);
    });
    proxyCommand.stdout.on("data", (data) => {
      // Launch props
      try {
        const { host, port } = JSON.parse(data);
        const wsUrl = `ws://${host}:${port}/websockify`;
        resolve(wsUrl);
      } catch (e) {
        reportProxyError(
          "initialize",
          i18next.t("proxyEvents.exit", {
            data,
          }),
        );
        reject(e);
      }
    });

    proxyCommand.spawn().then((proxyProcess) => {
      setTerminateFunc(() => {
        isTerminated = true;
        proxyProcess.kill();
      });
    });
  });
