import { scan } from "react-scan";
import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./Layout.tsx";

import { store } from "@/store.ts";
import { Provider } from "react-redux";

import "@/i18n/loaders/main.ts";

scan({
  enabled: true,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Layout />
    </Provider>
  </React.StrictMode>,
);
