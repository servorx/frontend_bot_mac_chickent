import { apiClient } from "../../../shared/api/apiClient";

export type DeliveryAvailability = {
  deliveryOrdersEnabled: boolean;
};

export async function getDeliveryAvailability() {
  const { data } = await apiClient.get<{ data: DeliveryAvailability }>("/admin/delivery/availability");
  return data.data;
}

export async function updateDeliveryAvailability(deliveryOrdersEnabled: boolean) {
  const { data } = await apiClient.patch<{ data: DeliveryAvailability }>("/admin/delivery/availability", {
    deliveryOrdersEnabled,
  });
  return data.data;
}
