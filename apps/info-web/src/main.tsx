
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { addSecurityHeaders } from "./utils/csp";

// Initialize security measures
addSecurityHeaders();

// Disable right-click context menu in production
if (import.meta.env.PROD) {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Disable common developer shortcuts
  document.addEventListener('keydown', (e) => {
    if (
      (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
      (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
      e.keyCode === 123 // F12
    ) {
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
