import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { Notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";

import App from "@/App.tsx";
import type { RootState } from "@/store.ts";

const Layout = () => {
  const { customize } = useSelector((state: RootState) => state.settings);

  const theme = createTheme(
    Object.assign(
      {
        /** Put your mantine theme override here */
      },
      customize.font_family.common
        ? {
            fontFamily: customize.font_family.common,
          }
        : undefined,
      customize.font_family.monospace
        ? {
            fontFamilyMonospace: customize.font_family.monospace,
          }
        : undefined,
      customize.font_family.headings
        ? {
            headings: {
              fontFamily: customize.font_family.headings,
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
