import React from "react";
import ReactDOM from "react-dom/client";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@xterm/xterm/css/xterm.css";

import "@/shell/style.css";

import ShellTabs from "@/shell/ShellTabs";
import ShellBackground from "@/shell/ShellBackground.tsx";

const theme = createTheme({
  /** Put your mantine theme override here */
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <ModalsProvider>
        <ShellBackground />
        <ShellTabs />
      </ModalsProvider>
    </MantineProvider>
  </React.StrictMode>,
);
