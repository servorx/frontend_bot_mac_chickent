import { AlertTriangle, CheckCircle2, Eye, PackageCheck, Printer, ReceiptText, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { formatCOP } from "../../../shared/utils/currency";
import { formatDateTime } from "../../../shared/utils/date";
import type { AdminOrder } from "../types/order.types";

type OrderCardProps = {
  order: AdminOrder;
  compact?: boolean;
  onAccept?: (order: AdminOrder) => void;
  onDeliver?: (order: AdminOrder) => void;
  onBlockedProof?: (order: AdminOrder) => void;
  onPrint?: (order: AdminOrder) => void;
  onReject?: (order: AdminOrder) => void;
};

export function OrderCard({ order, compact = false, onAccept, onDeliver, onBlockedProof, onPrint, onReject }: OrderCardProps) {
  const canPrint = order.status !== "CANCELLED";
  const canAccept = order.status === "CONFIRMED";
  const canDeliver = order.status === "PREPARING";
  const canReject = order.status === "CONFIRMED";
  const requiresPaymentProof = order.fulfillmentType === "DELIVERY" && order.paymentProofRequired;
  const blocksPreparation = requiresPaymentProof && order.paymentProofMissing;
  const locationText = order.fulfillmentType === "PICKUP"
    ? "Recoge en local"
    : `${order.customer.address} · ${order.customer.neighborhood}`;
  const paymentText = order.fulfillmentType === "PICKUP" ? "Sin domicilio" : order.paymentMethod;

  return (
    <Card className={[compact ? "p-4" : "p-5", "transition-transform duration-200 hover:-translate-y-0.5"].join(" ")}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge status={order.status} />
            <span className="break-all text-xs font-extrabold text-ember" translate="no">
              {order.orderNumber}
            </span>
          </div>
          <h2 className={["break-words font-extrabold text-paper", compact ? "text-base" : "text-xl"].join(" ")}>
            {order.customer.fullName}
          </h2>
          <p className="mt-1 break-words text-sm font-semibold text-bone">
            {order.customer.phone} · {locationText}
          </p>
          <p className="mt-1 text-sm font-medium text-smoke">
            {paymentText} · {formatDateTime(order.createdAt)}
          </p>
          {requiresPaymentProof ? (
            <p
              className={[
                "mt-2 inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-extrabold",
                blocksPreparation
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {blocksPreparation ? <AlertTriangle size={13} /> : <ReceiptText size={13} />}
              {blocksPreparation ? "Falta comprobante" : "Comprobante recibido"}
            </p>
          ) : null}
          <div className={["flex flex-wrap gap-2", compact ? "mt-2" : "mt-4"].join(" ")}>
            {order.items.slice(0, 3).map((item) => (
              <span
                className="rounded-full bg-white px-3 py-1 text-xs font-bold text-bone shadow-sm ring-1 ring-orange-100"
                key={item.id}
              >
                {item.quantity} x {item.productName}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 xl:items-end">
          <p className={["font-black text-paper", compact ? "text-xl" : "text-3xl"].join(" ")}>
            {formatCOP(order.total)}
          </p>
          <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-extrabold text-paper shadow-sm ring-1 ring-orange-200 transition-colors duration-200 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              to={`/orders/${order.id}`}
            >
              <Eye aria-hidden="true" size={18} />
              Ver detalle
            </Link>
            {canPrint && onPrint ? (
              <Button className="px-3" icon={<Printer size={18} />} onClick={() => onPrint?.(order)}>
                Imprimir
              </Button>
            ) : null}
            {canAccept && onAccept ? (
              <Button
                className={[
                  "px-3",
                  blocksPreparation
                    ? "bg-zinc-200 text-zinc-600 shadow-none hover:bg-zinc-300 focus-visible:ring-zinc-300"
                    : "",
                ].join(" ")}
                icon={<CheckCircle2 size={18} />}
                variant="success"
                onClick={() => {
                  if (blocksPreparation) {
                    onBlockedProof?.(order);
                    return;
                  }
                  onAccept?.(order);
                }}
              >
                Preparar
              </Button>
            ) : null}
            {canDeliver && onDeliver ? (
              <Button
                className="px-3"
                icon={<PackageCheck size={18} />}
                variant="success"
                onClick={() => onDeliver?.(order)}
              >
                Entregado
              </Button>
            ) : null}
            {canReject && onReject ? (
              <Button
                className="px-3"
                icon={<XCircle size={18} />}
                variant="danger"
                onClick={() => onReject?.(order)}
              >
                Cancelar
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
