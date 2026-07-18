import type { OrderStatus } from "../../features/orders/types/order.types";

const styles: Record<OrderStatus, string> = {
  CONFIRMED: "border-emerald-200 bg-emerald-100 text-emerald-800",
  PREPARING: "border-amber-200 bg-amber-100 text-amber-800",
  DELIVERED: "border-sky-200 bg-sky-100 text-sky-800",
  CANCELLED: "border-red-200 bg-red-100 text-red-800",
};

const labels: Record<OrderStatus, string> = {
  CONFIRMED: "Confirmado",
  PREPARING: "Preparando",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export function Badge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-extrabold",
        styles[status],
      ].join(" ")}
    >
      {labels[status]}
    </span>
  );
}
