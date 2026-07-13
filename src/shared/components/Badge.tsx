import type { OrderStatus } from "../../features/orders/types/order.types";

const styles: Record<OrderStatus, string> = {
  CONFIRMED: "border-amber-300/50 bg-amber-400/12 text-amber-200",
  PREPARING: "border-emerald-300/40 bg-emerald-400/12 text-emerald-200",
  DELIVERED: "border-sky-300/40 bg-sky-400/12 text-sky-200",
  CANCELLED: "border-red-300/40 bg-red-500/12 text-red-200",
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
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        styles[status],
      ].join(" ")}
    >
      {labels[status]}
    </span>
  );
}
