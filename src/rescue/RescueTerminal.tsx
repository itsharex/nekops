import { useEffect, useRef, useState } from "react";
import {
  Button,
  Code,
  LoadingOverlay,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import type { NoVncOptions } from "@novnc/novnc/lib/rfb";
import RFB from "@novnc/novnc/lib/rfb";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { listen } from "@tauri-apps/api/event";
import { notifications } from "@mantine/notifications";

import type { TabState } from "@/types/tabState.ts";
import type { AccessEmergency } from "@/types/server.ts";
import { startProxy } from "./startProxy.tsx";
import { EventPayloadRescuePowerCycleByNonce } from "@/events/payload.ts";
import {
  EventNameRescuePowerCycleByNonce,
  EventNameRescueSendCtrlAltDelByNonce,
} from "@/events/name.ts";

interface RescueTerminalProps {
  nonce: string;
  server: AccessEmergency;
  serverName: string;
  setRescueState: (state: TabState) => void;
  setNewMessage: () => void;
}
const RescueTerminal = ({
  nonce,
  server,
  serverName,
  setRescueState,
  setNewMessage,
}: RescueTerminalProps) => {
  const vncContainerEl = useRef<HTMLDivElement | null>(null);

  const vncInstanceRef = useRef<RFB | null>(null);

  const terminateFunc = useRef<(() => void) | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const setTerminateFunc = (func: (() => void) | null) => {
    terminateFunc.current = func;
  };

  const stateUpdateOnNewMessage = () => {
    if (isLoading) {
      setIsLoading(false);
      setRescueState("active");
    }
    setNewMessage();
  };

  const reportProxyError = (status: string, message: string) => {
    notifications.show({
      color: "red",
      title: (
        <>
          <Code>{serverName}</Code>
          <Text>Proxy {status}</Text>
        </>
      ),
      message,
    });
  };

  const reportVNCError = (status: string, message: string) => {
    notifications.show({
      color: "red",
      title: (
        <>
          <Code>{serverName}</Code>
          <Text>VNC {status}</Text>
        </>
      ),
      message,
    });
  };

  // Prepare noVNC options
  const vncOptions: NoVncOptions = {
    credentials: {
      // @ts-ignore: The type definition is maintained by 3rd party thus is wrong
      username: Boolean(server.username) ? server.username : undefined,
      // @ts-ignore: The type definition is maintained by 3rd party thus is wrong
      password: Boolean(server.password) ? server.password : undefined,
    },
  };

  // Mount hooks
  useEffect(() => {
    if (vncContainerEl.current) {
      // console.log("init", nonce, server); // debug log

      // Initialize VNC
      startProxy(
        reportProxyError,
        // setRescueState,
        setTerminateFunc,
        server.address,
      ).then((wsUrl) => {
        const novnc = new RFB(vncContainerEl.current!, wsUrl, vncOptions);

        vncInstanceRef.current = novnc;

        novnc.addEventListener("connect", stateUpdateOnNewMessage);
        novnc.addEventListener("disconnect", () => {
          if (isLoading) {
            setIsLoading(false);
          }
          setRescueState("terminated");
        });
        novnc.addEventListener("credentialsrequired", (ev) => {
          // Open input modal to add required content
          ev.detail;
          modals.open({
            title: (
              <>
                <Code>{serverName}</Code>
                <Text>Requires credential</Text>
              </>
            ),
            children: (
              <form
                onSubmit={(formSubmitEv) => {
                  formSubmitEv.preventDefault(); // Prevent from generating requests
                  console.log(formSubmitEv.currentTarget);
                  // novnc.sendCredentials(); // TODO
                }}
              >
                {ev.detail.types.includes("username") && (
                  <TextInput
                    name="username"
                    label="Username"
                    defaultValue={server.username}
                  />
                )}
                {ev.detail.types.includes("password") && (
                  <PasswordInput
                    name="password"
                    label="Password"
                    defaultValue={server.password}
                  />
                )}
                {ev.detail.types.includes("target") && (
                  <TextInput name="target" label="Target" />
                )}
                <Button fullWidth type="submit">
                  Submit
                </Button>
              </form>
            ),
          });
        });
        novnc.addEventListener("securityfailure", (ev) => {
          reportVNCError(
            "security failure",
            `Status: ${ev.detail.status}, reason: ${ev.detail.reason}`,
          );
        });
        novnc.addEventListener("clipboard", (ev) => {
          // Open context modal with clipboard text
          modals.openConfirmModal({
            title: (
              <>
                <Code>{serverName}</Code>
                <Text>Clipboard</Text>
              </>
            ),
            children: <Code block>{ev.detail.text}</Code>,
            centered: true,
            labels: { confirm: "Copy", cancel: "Close" },
            onConfirm: () => {
              writeText(ev.detail.text);
            },
          });
        });
        novnc.addEventListener("bell", () => {
          setNewMessage();
        });
        novnc.addEventListener("desktopname", (ev) => {
          notifications.show({
            color: "blue",
            title: (
              <>
                <Code>{serverName}</Code>
                <Text>Desktop Changed</Text>
              </>
            ),
            message: `New desktop name: ${ev.detail.name}`,
          });
        });
        novnc.addEventListener("capabilities", (ev) => {
          notifications.show({
            color: "blue",
            title: (
              <>
                <Code>{serverName}</Code>
                <Text>Capabilities Changed</Text>
              </>
            ),
            message: `New capabilities: ${JSON.stringify(ev.detail.capabilities)}`,
          });
        });
      });

      // Listen to power cycle events
      const stopRescuePowerCycleByNonceListener =
        listen<EventPayloadRescuePowerCycleByNonce>(
          EventNameRescuePowerCycleByNonce,
          (ev) => {
            if (ev.payload.nonce === nonce) {
              switch (ev.payload.action) {
                case "shutdown":
                  vncInstanceRef.current?.machineShutdown();
                  break;
                case "reset":
                  vncInstanceRef.current?.machineReset();
                  break;
                case "reboot":
                  vncInstanceRef.current?.machineReboot();
                  break;
              }
            }
          },
        );

      // Listen to Ctrl + Alt + Del
      const stopRescueSendCtrlAltDelByNonce = listen<string>(
        EventNameRescueSendCtrlAltDelByNonce,
        (ev) => {
          if (ev.payload === nonce) {
            vncInstanceRef.current?.sendCtrlAltDel();
          }
        },
      );

      return () => {
        (async () => {
          (await stopRescuePowerCycleByNonceListener)();
        })();
        (async () => {
          (await stopRescueSendCtrlAltDelByNonce)();
        })();

        // Terminate Proxy
        if (terminateFunc.current !== null) {
          terminateFunc.current();
        }

        // console.log("terminate", nonce); // debug log
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
        ref={vncContainerEl}
        style={{
          height: "100%",
          opacity: isLoading ? 0 : 100,
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

export default RescueTerminal;
