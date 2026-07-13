import { useEffect, useState } from "react";

import { Button } from "../../../shared/components/Button";
import { Modal } from "../../../shared/components/Modal";
import type { AdminOrder } from "../types/order.types";

type RejectOrderModalProps = {
  order: AdminOrder | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
};

export function RejectOrderModal({ order, isLoading, onClose, onConfirm }: RejectOrderModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    setReason("");
  }, [order?.id]);

  return (
    <Modal isOpen={Boolean(order)} title="Cancelar pedido" onClose={onClose}>
      <p className="text-sm leading-6 text-bone">
        Confirma la cancelacion del pedido{" "}
        <span className="font-display text-flame" translate="no">
          {order?.orderNumber}
        </span>
        . El pedido quedara visible solo para consulta.
      </p>
      <label className="mt-4 block text-sm font-semibold text-paper" htmlFor="reject-reason">
        Motivo opcional
      </label>
      <textarea
        className="mt-2 min-h-28 w-full rounded-md border border-orange-200 bg-white p-3 text-paper outline-none transition-colors duration-200 placeholder:text-smoke focus-visible:ring-2 focus-visible:ring-flame"
        id="reject-reason"
        maxLength={500}
        name="reject-reason"
        placeholder="Ejemplo: cliente no confirma direccion..."
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button isLoading={isLoading} variant="danger" onClick={() => onConfirm(reason)}>
          Cancelar Pedido
        </Button>
      </div>
    </Modal>
  );
}
