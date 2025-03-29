import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Initialize the application
async function initApp() {
  try {
    // Initialize parks data if needed
    await fetch("/api/initialize", { method: "POST" });
  } catch (error) {
    console.error("Failed to initialize parks data:", error);
  }

  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

initApp();
