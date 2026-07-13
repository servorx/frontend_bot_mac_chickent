import { apiClient } from "../../../shared/api/apiClient";
import type { StockControl } from "../types/stock";

export async function getStockControls() {
  const { data } = await apiClient.get<{ data: StockControl[] }>("/admin/catalog/stock-controls");
  return data.data;
}

export async function updateStockControl(code: string, isAvailable: boolean) {
  const { data } = await apiClient.patch<{ data: StockControl }>(`/admin/catalog/stock-controls/${code}`, {
    isAvailable,
  });
  return data.data;
}
