import React from "react";
import ReactDOM from "react-dom/client";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import "@/rescue/style.css";

import RescueTabs from "@/rescue/RescueTabs";
import WindowBackground from "@/common/WindowBackground.tsx";

const theme = createTheme({
  /** Put your mantine theme override here */
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <ModalsProvider>
        <WindowBackground />
        <RescueTabs />
      </ModalsProvider>
    </MantineProvider>
  </React.StrictMode>,
);
