import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { configureApi } from "@begim/shared";
import "./index.css";
import App from "./App";

// Конфигурируем общий слой данных. Авторизация админа выполняется отдельно
// (Telegram Login), поэтому здесь только базовый URL + хранилище токенов.
configureApi({
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
