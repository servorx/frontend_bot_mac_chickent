import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";

import { Button } from "../../../shared/components/Button";
import { Modal } from "../../../shared/components/Modal";
import { formatCOP } from "../../../shared/utils/currency";
import type { AdminOrder } from "../types/order.types";

type EditDeliveryModalProps = {
  order: AdminOrder | null;
  isLoading?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onConfirm: (input: {
    customerAddress: string;
    deliveryFeeCop: number;
    deliveryZone?: string;
  }) => void;
};

export function EditDeliveryModal({
  order,
  isLoading = false,
  errorMessage = "",
  onClose,
  onConfirm,
}: EditDeliveryModalProps) {
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryZone, setDeliveryZone] = useState("");
  const [deliveryFeeText, setDeliveryFeeText] = useState("");

  useEffect(() => {
    if (!order) return;
    setCustomerAddress(order.customer.address);
    setDeliveryZone(inferZoneFromAddress(order.customer.address));
    setDeliveryFeeText(String(order.deliveryFee));
  }, [order]);

  const deliveryFeeCop = parseCOPInput(deliveryFeeText);
  const total = useMemo(() => (order ? order.subtotal + deliveryFeeCop : 0), [deliveryFeeCop, order]);
  const canSubmit = Boolean(order && customerAddress.trim() && deliveryFeeCop >= 0);

  return (
    <Modal isOpen={Boolean(order)} title="Editar domicilio" onClose={onClose}>
      {order ? (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit) return;
            onConfirm({
              customerAddress: customerAddress.trim(),
              deliveryFeeCop,
              deliveryZone: deliveryZone.trim() || undefined,
            });
          }}
        >
          <div className="rounded-lg border border-orange-200 bg-white p-4">
            <p className="text-xs font-extrabold uppercase text-smoke">{order.orderNumber}</p>
            <p className="mt-1 font-extrabold text-paper">{order.customer.fullName}</p>
            <p className="text-sm font-semibold text-bone">{order.customer.phone}</p>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-paper">Direccion y barrio del pedido</span>
            <textarea
              className="min-h-24 resize-y rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-paper outline-none transition focus:border-flame focus:ring-2 focus:ring-flame/30"
              value={customerAddress}
              onChange={(event) => setCustomerAddress(event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-paper">Barrio o zona para guardar esta tarifa</span>
            <input
              className="min-h-11 rounded-lg border border-orange-200 bg-white px-3 text-sm font-semibold text-paper outline-none transition focus:border-flame focus:ring-2 focus:ring-flame/30"
              placeholder="Ej: El Manantial"
              value={deliveryZone}
              onChange={(event) => setDeliveryZone(event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-paper">Valor real del domicilio</span>
            <input
              className="min-h-11 rounded-lg border border-orange-200 bg-white px-3 text-sm font-semibold text-paper outline-none transition focus:border-flame focus:ring-2 focus:ring-flame/30"
              inputMode="numeric"
              placeholder="4000"
              value={deliveryFeeText}
              onChange={(event) => setDeliveryFeeText(event.target.value)}
            />
          </label>

          <div className="grid gap-2 rounded-lg border border-orange-200 bg-[#fff8e9] p-4 text-sm font-bold text-bone">
            <div className="flex justify-between gap-3">
              <span>Subtotal</span>
              <span>{formatCOP(order.subtotal)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Domicilio corregido</span>
              <span>{formatCOP(deliveryFeeCop)}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-orange-200 pt-2 text-lg font-black text-paper">
              <span>Total nuevo</span>
              <span>{formatCOP(total)}</span>
            </div>
          </div>

          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
            Al guardar, se actualiza el pedido, se guarda esta tarifa para futuros chats y se envia una disculpa al cliente con el detalle actualizado.
          </p>
          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              icon={isLoading ? undefined : <Save size={18} />}
              isLoading={isLoading}
              disabled={!canSubmit}
              type="submit"
            >
              Guardar y avisar
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}

function parseCOPInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function inferZoneFromAddress(address: string) {
  const parts = address
    .split(/\s+-\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : "";
}
