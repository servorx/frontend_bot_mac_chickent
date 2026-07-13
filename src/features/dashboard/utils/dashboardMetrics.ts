import type { AdminOrder } from "../../orders/types/order.types";

type DashboardMetricInput = {
  incoming: AdminOrder[];
  accepted: AdminOrder[];
  rejected: AdminOrder[];
  now?: Date;
};

export type DashboardMetrics = {
  receivedCount: number;
  preparingCount: number;
  cancelledCount: number;
  totalSoldToday: number;
};

export function calculateDashboardMetrics({
  incoming,
  accepted,
  rejected,
  now = new Date(),
}: DashboardMetricInput): DashboardMetrics {
  const activeOrders = [...incoming, ...accepted];
  return {
    receivedCount: incoming.length,
    preparingCount: accepted.filter((order) => order.status === "PREPARING").length,
    cancelledCount: rejected.length,
    totalSoldToday: activeOrders
      .filter((order) => order.status !== "CANCELLED")
      .filter((order) => isSameDayInColombia(order.createdAt, now))
      .reduce((sum, order) => sum + order.total, 0),
  };
}

export function isSameDayInColombia(value: string, now: Date = new Date()): boolean {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date(value)) === formatter.format(now);
}
