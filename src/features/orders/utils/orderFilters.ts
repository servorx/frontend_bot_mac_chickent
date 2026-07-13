import type { AdminOrder } from "../types/order.types";

export function filterOrdersBySearch(orders: AdminOrder[], query: string): AdminOrder[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return orders;
  }

  return orders.filter((order) => normalize(searchableOrderText(order)).includes(normalizedQuery));
}

export function sortOrdersNewestFirst(orders: AdminOrder[]): AdminOrder[] {
  return [...orders].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function searchableOrderText(order: AdminOrder): string {
  return [
    order.orderNumber,
    order.invoiceNumber ?? "",
    order.status,
    order.customer.fullName,
    order.customer.phone,
    order.customer.address,
    order.customer.neighborhood,
    order.paymentMethod,
    order.observations ?? "",
    String(order.total),
    ...order.items.map((item) => `${item.productCode ?? ""} ${item.productName}`),
  ].join(" ");
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
