export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api",
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL ?? "ws://localhost:3000/ws",
  thermalPrinterName: import.meta.env.VITE_THERMAL_PRINTER_NAME ?? "MCCHICKEN",
};
