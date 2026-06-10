import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { SweepstakeDraw } from "./SweepstakeDraw";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SweepstakeDraw />
  </StrictMode>
);
