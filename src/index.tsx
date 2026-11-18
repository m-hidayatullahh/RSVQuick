import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/rochester";
import "@fontsource-variable/merienda";
import "@fontsource/kaushan-script";

import "./utility/dayjs";
import { initSentry } from "./utility/sentry";
import App from "./App";

initSentry();

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
