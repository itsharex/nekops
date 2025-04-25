import React from "react";
import ReactDOM from "react-dom/client";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "xterm/css/xterm.css";

import "@/shell/style.css";

import ShellTabs from "@/shell/ShellTabs";
import WindowBackground from "@/common/WindowBackground.tsx";
import TerminalProvider from "@/shell/TerminalContext.tsx";

import "@/i18n/loaders/shell.ts";

const theme = createTheme({
  /** Put your mantine theme override here */
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <ModalsProvider>
        <WindowBackground />

        <TerminalProvider>
          <ShellTabs />
        </TerminalProvider>
      </ModalsProvider>
    </MantineProvider>
  </React.StrictMode>,
);
