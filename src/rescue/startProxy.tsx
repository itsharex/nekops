// import type { TabState } from "@/types/tabState.ts";
import { Command } from "@tauri-apps/plugin-shell";

export const startProxy = (
  reportProxyError: (status: string, message: string) => void,
  // setRescueState: (newState: TabState) => void,
  setTerminateFunc: (func: (() => void) | null) => void,
  vncAddress: string,
) =>
  new Promise<string>((resolve, reject) => {
    // Start proxy

    const proxyCommand = Command.sidecar("embedded/bin/websockify", [
      "-t",
      vncAddress,
    ]);

    // Mount event listeners
    proxyCommand.on("close", (data) => {
      // setRescueState("terminated");

      reportProxyError("exited", `Proxy exited with code ${data.code} .`);

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
        reportProxyError("initialize failed", `Invalid JSON: ${data}`);
        reject(e);
      }
    });

    proxyCommand.spawn().then((proxyProcess) => {
      setTerminateFunc(() => proxyProcess.kill());
    });
  });
