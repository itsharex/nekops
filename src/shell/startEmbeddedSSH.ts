import { Child, Command } from "@tauri-apps/plugin-shell";
import type { Terminal } from "@xterm/xterm";

import type { AccessRegular } from "@/types/server.ts";
import type { TabState } from "@/types/tabState.ts";
import type { ShellClientOptions } from "@/events/payload.ts";
import { hostKeyEventHandler } from "./hostKeyEventHandler.tsx";

export const startEmbeddedSSH = (
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
  let alreadyTerminated = false;
  setTerminateSSHFunc(() => {
    alreadyTerminated = true;
  });

  const sshArgs = [];
  if (client.workspaceKnownHostsFile) {
    sshArgs.push("-o", `UserKnownHostsFile=${client.workspaceKnownHostsFile}`);
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
    setShellState("terminated");

    // Print message
    terminal.writeln(
      `Process ended ${
        data.code === 0
          ? "\x1B[32msuccessfully\x1B[0m"
          : `with code \x1B[1;31m${data.code}\x1B[0m`
      }.`,
    );

    // Invalidate terminate func
    setTerminateSSHFunc(null);
  });
  sshCommand.on("error", (data) => {
    // Print error
    terminal.writeln(`Process error: \x1B[1;31m${data}\x1B[0m`);
  });
  sshCommand.stdout.on("data", (data) => {
    if (!isSSHStart) {
      // Not start, should be events
      const eventsStartIndex = data.indexOf(0x02);
      const eventsEndIndex = data.indexOf(0x03);
      console.log("evStart", eventsStartIndex, "evEnd", eventsEndIndex);

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
              console.log("SSH start!");
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
              console.log("Host key mismatch event", eventPayload); // TODO
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
    stateUpdateOnNewMessage();

    terminal.write("\x1B[1;31m"); // Write color control bytes to change output color to red
    terminal.write(data); // Write Uint8Array data in raw mode
    terminal.write("\x1B[0m"); // Write color reset bytes to recover color to default (white)
    // console.log("stderr", data);
  });

  // Start SSH process
  sshCommand.spawn().then((sshProcess) => {
    if (alreadyTerminated) {
      // Already sent terminate signal, but still loading, so should stop immediately
      sshProcess.kill();
      return;
    } else {
      // Terminate when close
      setTerminateSSHFunc(() => sshProcess.kill());
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
