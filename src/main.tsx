import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { injectAboutImagePreload } from "@/lib/preload-portfolio";
import "./index.css";

// Start about portrait fetch before React paints
injectAboutImagePreload();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
