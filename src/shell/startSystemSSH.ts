import type { Terminal } from "xterm";
import type { AccessRegular } from "@/types/server.ts";
import { Command } from "@tauri-apps/plugin-shell";
import type { TabState } from "@/types/tabState.ts";
import { listen } from "@tauri-apps/api/event";
import type {
  EventPayloadShellSendCommandByNonce,
  ShellClientOptions,
} from "@/events/payload.ts";
import {
  EventNameShellSendCommandByNonce,
  EventNameShellSTTYFitByNonce,
} from "@/events/name.ts";

export const startSystemSSH = (
  nonce: string,
  terminal: Terminal,
  stateUpdateOnNewMessage: () => void,
  setShellState: (newState: TabState) => void,
  setTerminateSSHFunc: (func: (() => void) | null) => void,
  client: ShellClientOptions,
  server: AccessRegular,
  jumpServer?: AccessRegular,
) => {
  let alreadyTerminated = false;
  setTerminateSSHFunc(() => {
    alreadyTerminated = true;
  });

  const sshArgs = [
    "-tt", // force Pseudo-terminal
  ];
  if (client.sshPrivateKey) {
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

  // Pipe message from ssh to terminal
  const sshCommand = Command.create("system-ssh", sshArgs, {
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

      // Listen to fit event
      const stopShellSTTYFitByNonceListener = listen<string>(
        EventNameShellSTTYFitByNonce,
        (ev) => {
          if (ev.payload === nonce) {
            sshProcess.write(
              `stty columns ${terminal.cols} rows ${terminal.rows}\n`,
            );
          }
        },
      );

      // Terminate when close
      setTerminateSSHFunc(() => {
        sshProcess.kill();

        (async () => {
          (await stopSendCommandByNonceListener)();
          (await stopShellSTTYFitByNonceListener)();
        })();
      });
    }

    // console.log(sshProcess);

    // Pipe input from terminal to ssh
    terminal.onData((data) => {
      sshProcess.write(data);
    });
    terminal.onBinary((data) => {
      sshProcess.write(data);
    });

    // Sync resize event
    // terminal.onResize(({ cols, rows }) => {
    //   // A friendly notice: all methods list below don't work. Don't waste your time trying them.

    //   // Method 1: ANSI escape sequences
    //   // sshProcess.write(`\x1B[8;${rows};${cols}t`); // Can't send as a whole
    //   // sshProcess.write(`\e[8;${rows};${cols}t`); // Can't send as a whole
    //   // terminal.input(`\x1B[8;${rows};${cols}t`, false); // Same issue as above
    //   // terminal.input(`\e[8;${rows};${cols}t`, false); // Same issue as above
    //   // terminal.write(`\x1B[8;${rows};${cols}t`); // Not working (local only maybe?)
    //
    //   // Method 2: stty command
    //   // sshProcess.write(`stty columns ${cols} rows ${rows}\n`); // It works but is raw text input and will cause data corruption
    //
    //   // Method 3: SIGWINCH signal
    //   // Since Windows OS doesn't have unix signal system, sending SIGWINCH to ssh process is only a platform-specific solution.
    //
    //   // Method 4: fcntl.ioctl TIOCSWINSZ
    //
    //   // Method 0: Let backend (rust) handle this :P
    //   // invoke("set_ssh_size", {
    //   //   pid: sshProcess.pid,
    //   //   row: rows,
    //   //   col: cols,
    //   //   width: terminal.element?.clientWidth || cols * 9,
    //   //   height: terminal.element?.clientHeight || rows * 17,
    //   // });
    // });
  });
};
