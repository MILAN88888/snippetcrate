import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
(() => {
  const root = createRoot(
    document.getElementById("snippet-master") as HTMLElement
  );

  if (!root) return;

  root.render(<App />);
})();
