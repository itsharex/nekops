import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { Notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";

import App from "@/App.tsx";
import type { RootState } from "@/store.ts";

const Layout = () => {
  const { font_family } = useSelector((state: RootState) => state.settings);

  const theme = createTheme(
    Object.assign(
      {
        /** Put your mantine theme override here */
      },
      font_family.common
        ? {
            fontFamily: font_family.common,
          }
        : undefined,
      font_family.monospace
        ? {
            fontFamilyMonospace: font_family.monospace,
          }
        : undefined,
      font_family.headings
        ? {
            headings: {
              fontFamily: font_family.headings,
            },
          }
        : undefined,
    ),
  );

  return (
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <Notifications />
        <App />
      </BrowserRouter>
    </MantineProvider>
  );
};

export default Layout;
