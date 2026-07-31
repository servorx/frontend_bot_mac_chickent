import { apiClient } from "../../../shared/api/apiClient";

export type DeliveryAvailability = {
  deliveryOrdersEnabled: boolean;
};

export type DailyProductReportItem = {
  productCode: string | null;
  productName: string;
  quantity: number;
  totalCop: number;
};

export type DailyProductReport = {
  date: string;
  generatedAt: string;
  items: DailyProductReportItem[];
  totalQuantity: number;
  totalCop: number;
};

type DeliverySettings = DeliveryAvailability & {
  name: string;
  publicPhone?: string | null;
  address?: string | null;
  deliveryBasePriceCop: number;
  deliveryPricePerKmCop: number;
  deliveryMaxKm: number;
};

export async function getDeliveryAvailability() {
  try {
    const { data } = await apiClient.get<{ data: DeliveryAvailability }>("/admin/delivery/availability");
    return data.data;
  } catch (error) {
    const { data } = await apiClient.get<{ data: DeliverySettings }>("/admin/delivery/settings");
    return {
      deliveryOrdersEnabled: data.data.deliveryOrdersEnabled,
    };
  }
}

export async function updateDeliveryAvailability(deliveryOrdersEnabled: boolean) {
  try {
    const { data } = await apiClient.patch<{ data: DeliveryAvailability }>("/admin/delivery/availability", {
      deliveryOrdersEnabled,
    });
    return data.data;
  } catch (error) {
    const settingsResponse = await apiClient.get<{ data: DeliverySettings }>("/admin/delivery/settings");
    const settings = settingsResponse.data.data;
    const { data } = await apiClient.put<{ data: DeliverySettings }>("/admin/delivery/settings", {
      name: settings.name,
      publicPhone: settings.publicPhone,
      address: settings.address,
      deliveryOrdersEnabled,
      deliveryBasePriceCop: settings.deliveryBasePriceCop,
      deliveryPricePerKmCop: settings.deliveryPricePerKmCop,
      deliveryMaxKm: settings.deliveryMaxKm,
    });
    return {
      deliveryOrdersEnabled: data.data.deliveryOrdersEnabled,
    };
  }
}

export async function getDailyProductReport(date?: string) {
  const { data } = await apiClient.get<{ data: DailyProductReport }>("/admin/reports/daily-products", {
    params: date ? { date } : undefined,
  });
  return data.data;
}
