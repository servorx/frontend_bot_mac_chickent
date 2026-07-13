import { apiClient } from "../../../shared/api/apiClient";
import type { AdminOrder, OrderListKind, OrderStatus } from "../types/order.types";

export async function getOrders(kind: OrderListKind): Promise<AdminOrder[]> {
  const { data } = await apiClient.get<{ data: AdminOrder[] }>(`/admin/orders/${kind}`);
  return data.data;
}

export async function getOrder(id: string): Promise<AdminOrder> {
  const { data } = await apiClient.get<{ data: AdminOrder }>(`/admin/orders/${id}`);
  return data.data;
}

export async function acceptOrder(id: string): Promise<AdminOrder> {
  const { data } = await apiClient.patch<{ data: AdminOrder }>(`/admin/orders/${id}/accept`);
  return data.data;
}

export async function rejectOrder(id: string, reason?: string): Promise<AdminOrder> {
  const { data } = await apiClient.patch<{ data: AdminOrder }>(`/admin/orders/${id}/reject`, {
    reason: reason?.trim() || null,
  });
  return data.data;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<AdminOrder> {
  const { data } = await apiClient.patch<{ data: AdminOrder }>(`/admin/orders/${id}/status`, {
    status,
  });
  return data.data;
}
