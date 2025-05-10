import { Child, Command } from "@tauri-apps/plugin-shell";
import type { Terminal } from "xterm";
import { listen } from "@tauri-apps/api/event";
import { notifications } from "@mantine/notifications";

import type { AccessRegular } from "@/types/server.ts";
import type { TabState } from "@/types/tabState.ts";
import type {
  EventPayloadShellSendCommandByNonce,
  ShellClientOptions,
} from "@/events/payload.ts";
import { hostKeyEventHandler } from "./hostKeyEventHandler.tsx";
import { EventNameShellSendCommandByNonce } from "@/events/name.ts";
import i18next from "@/i18n/loaders/shell.ts";
import { Code } from "@mantine/core";

export const startEmbeddedSSH = (
  nonce: string,
  terminal: Terminal,
  stateUpdateOnNewMessage: () => void,
  setShellState: (newState: TabState) => void,
  setTerminateSSHFunc: (func: (() => void) | null) => void,
  client: ShellClientOptions,
  server: AccessRegular,
  serverName: string,
  themeColor: string,
  jumpServer?: AccessRegular,
) => {
  let isTerminated = false;
  setTerminateSSHFunc(() => {
    isTerminated = true;
  });

  const sshArgs = [];
  if (client.workspaceKnownHostsFile) {
    sshArgs.push("-o", `UserKnownHostsFile=${client.workspaceKnownHostsFile}`);
  }
  if (client.sshPrivateKey) {
    // sshArgs.push("-o", "IdentitiesOnly=yes");
    sshArgs.push("-i", client.sshPrivateKey);
  }
  if (jumpServer) {
    sshArgs.push(
      "-J",
      `${jumpServer.user || "root"}@${jumpServer.address}` +
        (jumpServer.port !== 22 ? `:${jumpServer.port}` : ""),
    );
  }
  if (server.port !== 22) {
    // Is not default SSH port
    sshArgs.push("-p", server.port.toString());
  }
  sshArgs.push(`${server.user || "root"}@${server.address}`);

  // console.log("Args", sshArgs.join(" "));
  let isSSHStart = false;
  const eventDecoder = new TextDecoder("ascii");
  let stateSSHProcess: Child;

  // Pipe message from ssh to terminal
  const sshCommand = Command.sidecar("embedded/bin/pipessh", sshArgs, {
    encoding: "raw",
  });
  sshCommand.on("close", (data) => {
    stateUpdateOnNewMessage();
    setShellState("terminated");

    if (!isTerminated) {
      // Print to terminal
      terminal.writeln(
        `Process exited ${
          data.code === 0
            ? "\x1B[32msuccessfully\x1B[0m"
            : `with code \x1B[1;31m${data.code}\x1B[0m`
        }.`,
      );

      // Send notification
      if (data.code !== 0) {
        notifications.show({
          color: "red",
          title: (
            <>
              {serverName} <Code>{i18next.t("sshEvents.source_process")}</Code>
            </>
          ),
          message: i18next.t("sshEvents.processClose_error", {
            code: data.code,
          }),
        });
      }
    }

    // Invalidate terminate func
    setTerminateSSHFunc(null);
  });
  sshCommand.on("error", (data) => {
    // Send notification
    notifications.show({
      color: "red",
      title: (
        <>
          {serverName} <Code>{i18next.t("sshEvents.source_process")}</Code>
        </>
      ),
      message: data,
    });
  });
  sshCommand.stdout.on("data", (data) => {
    if (!isSSHStart) {
      // Not start, should be events
      const eventsStartIndex = data.indexOf(0x02);
      const eventsEndIndex = data.indexOf(0x03);
      // console.log("evStart", eventsStartIndex, "evEnd", eventsEndIndex);

      if (eventsStartIndex != -1 && eventsEndIndex != -1) {
        let isEventProcessed = false;

        // Includes full event, start processing
        const eventBody = data.slice(eventsStartIndex + 1, eventsEndIndex);
        const eventsSplitterIndex = eventBody.indexOf(0x1f);
        if (eventsSplitterIndex == -1) {
          // event doesn't have payload
          const eventName = eventDecoder.decode(
            new Uint8Array(eventBody).buffer,
          );
          switch (eventName) {
            case "sshStart":
              // console.log("SSH start!");
              stateUpdateOnNewMessage();
              isSSHStart = true;
              isEventProcessed = true;
              break;
            default:
              console.warn("Unsupported event", eventName);
          }
        } else {
          const eventName = eventDecoder.decode(
            new Uint8Array(eventBody.slice(0, eventsSplitterIndex)).buffer,
          );
          const eventPayload = JSON.parse(
            eventDecoder.decode(
              new Uint8Array(eventBody.slice(eventsSplitterIndex + 1)).buffer,
            ),
          );
          switch (eventName) {
            case "hostKey":
              // console.log("Host key mismatch event", eventPayload);
              hostKeyEventHandler(
                serverName,
                themeColor,
                eventPayload,
                () => stateSSHProcess.write("y"), // yes
                () => stateSSHProcess.write("n"), // no
              );
              isEventProcessed = true;
              break;
            default:
              console.warn("Unsupported event", eventName, eventPayload);
          }
        }

        // Check if event has been processed successfully
        if (isEventProcessed) {
          // Send data before and after event directly to terminal
          if (eventsStartIndex > 0) {
            terminal.write(data.slice(0, eventsStartIndex));
          }
          if (eventsEndIndex + 1 < data.length) {
            terminal.write(data.slice(eventsEndIndex + 1));
          }
          // No need to write full data, quit this round
          return;
        } // else go normal process
      } else {
        // Incomplete event, unable to process now
        console.warn("Incomplete event", data);
      }
    } // else: ssh has already started, we don't need to manipulate data anymore

    // Normal data write process
    stateUpdateOnNewMessage();

    terminal.write(data);
    // console.log("stdout", data);
  });
  sshCommand.stderr.on("data", (data) => {
    if (!isSSHStart) {
      // From client, use notification to show error
      notifications.show({
        color: "red",
        title: (
          <>
            {serverName} <Code>{i18next.t("sshEvents.source_stderr")}</Code>
          </>
        ),
        message: eventDecoder.decode(new Uint8Array(data).buffer),
      });
    } else {
      // From server, should print to terminal
      stateUpdateOnNewMessage();

      terminal.write("\x1B[1;31m"); // Write color control bytes to change output color to red
      terminal.write(data); // Write Uint8Array data in raw mode
      terminal.write("\x1B[0m"); // Write color reset bytes to recover color to default (white)
      // console.log("stderr", data);
    }
  });

  // Start SSH process
  sshCommand.spawn().then((sshProcess) => {
    if (isTerminated) {
      // Already sent terminate signal, but still loading, so should stop immediately
      sshProcess.kill();
      return;
    } else {
      // Listen to multirun commands
      const stopSendCommandByNonceListener =
        listen<EventPayloadShellSendCommandByNonce>(
          EventNameShellSendCommandByNonce,
          (ev) => {
            if (ev.payload.nonce.includes(nonce)) {
              sshProcess.write(ev.payload.command);
            }
          },
        );

      // Terminate when close
      setTerminateSSHFunc(() => {
        isTerminated = true;
        sshProcess.kill();

        (async () => {
          (await stopSendCommandByNonceListener)();
        })();
      });
    }

    // console.log(sshProcess);
    stateSSHProcess = sshProcess;

    // Pipe input from terminal to ssh
    terminal.onData((data) => {
      sshProcess.write(data);
    });
    terminal.onBinary((data) => {
      sshProcess.write(data);
    });

    // Sync resize event
    terminal.onResize(({ cols, rows }) => {
      sshProcess.write(`\x1B[8;${rows};${cols}t`);
    });
  });
};
