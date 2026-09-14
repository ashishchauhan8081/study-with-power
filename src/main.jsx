import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import HelpChat from "./HelpChat.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <HelpChat />
  </StrictMode>
);