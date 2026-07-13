import { Modal } from "../../../shared/components/Modal";
import type { AdminOrder } from "../types/order.types";
import { OrderSummary } from "./OrderSummary";

export function OrderDetailModal({
  order,
  onClose,
}: {
  order: AdminOrder | null;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={Boolean(order)} title="Detalle del pedido" onClose={onClose}>
      {order ? <OrderSummary order={order} /> : null}
    </Modal>
  );
}
