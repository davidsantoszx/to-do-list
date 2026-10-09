import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { TaskProvider } from "./context/TaskContext";
import "./styles/index.css";


import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <TaskProvider>
  <App />
  <Toaster
    position="bottom-right"
    toastOptions={{
      style: {
        background: "#1e293b",
        color: "#fff",
        border: "1px solid #475569"
      }
    }}
  />
</TaskProvider>
    </BrowserRouter>
  </StrictMode>
);