import { Printer } from "lucide-react";

import { Button } from "../../../shared/components/Button";
import { Modal } from "../../../shared/components/Modal";
import { formatCOP } from "../../../shared/utils/currency";
import type { AdminOrder } from "../types/order.types";

type InvoicePrintModalProps = {
  order: AdminOrder | null;
  isLoading: boolean;
  errorMessage?: string;
  onClose: () => void;
  onPrint: () => void;
};

export function InvoicePrintModal({ order, isLoading, errorMessage, onClose, onPrint }: InvoicePrintModalProps) {
  return (
    <Modal isOpen={Boolean(order)} title="Imprimir factura" onClose={onClose}>
      {order ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <p className="font-display text-sm text-flame" translate="no">
              {order.orderNumber}
            </p>
            <p className="mt-1 text-lg font-bold text-paper">{order.customer.fullName}</p>
            <p className="text-sm text-bone">
              {order.fulfillmentType === "PICKUP" ? "Recoge en local" : order.customer.address}
            </p>
            <p className="mt-3 font-display text-2xl font-bold text-paper">
              {formatCOP(order.total)}
            </p>
          </div>
          {errorMessage ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button icon={<Printer size={18} />} isLoading={isLoading} onClick={onPrint}>
              Imprimir Factura
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
