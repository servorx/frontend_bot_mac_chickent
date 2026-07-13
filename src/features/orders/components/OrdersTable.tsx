import { AlertTriangle, CheckCircle2, Eye, PackageCheck, Printer, ReceiptText, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";
import { formatCOP } from "../../../shared/utils/currency";
import { formatDateTime } from "../../../shared/utils/date";
import type { AdminOrder } from "../types/order.types";

type OrdersTableProps = {
  orders: AdminOrder[];
  onAccept?: (order: AdminOrder) => void;
  onDeliver?: (order: AdminOrder) => void;
  onBlockedProof?: (order: AdminOrder) => void;
  onPrint?: (order: AdminOrder) => void;
  onReject?: (order: AdminOrder) => void;
};

export function OrdersTable({ orders, onAccept, onDeliver, onBlockedProof, onPrint, onReject }: OrdersTableProps) {
  const blockedMessage = "Falta comprobante de pago para pasar este pedido a preparacion.";
  return (
    <div className="ops-surface overflow-hidden rounded-lg">
      <table className="w-full table-fixed border-collapse text-left text-[11px] xl:text-[12px] 2xl:text-[13px]">
        <colgroup>
          <col className="w-[17%]" />
          <col className="w-[18%]" />
          <col className="w-[22%]" />
          <col className="w-[10%]" />
          <col className="w-[11%]" />
          <col className="w-[12%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead className="bg-[#fff8e9] text-[11px] uppercase text-smoke">
          <tr>
            <th className="px-2 py-3">Pedido</th>
            <th className="px-2 py-3">Cliente</th>
            <th className="px-2 py-3">Direccion</th>
            <th className="px-2 py-3">Pago</th>
            <th className="px-2 py-3">Total</th>
            <th className="px-2 py-3">Fecha</th>
            <th className="px-2 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const requiresPaymentProof = order.fulfillmentType === "DELIVERY" && order.paymentProofRequired;
            const blocksPreparation = requiresPaymentProof && order.paymentProofMissing;
            return (
            <tr className="border-t border-orange-100 transition-colors hover:bg-orange-50/70" key={order.id}>
              <td className="px-2 py-2 align-top">
                <div className="flex flex-col gap-2">
                  <span className="break-all font-semibold text-ember" translate="no">
                    {order.orderNumber}
                  </span>
                  <Badge status={order.status} />
                </div>
              </td>
              <td className="px-2 py-2 align-top">
                <p className="font-semibold text-paper">{order.customer.fullName}</p>
                <p className="text-xs font-medium text-bone">{order.customer.phone}</p>
              </td>
              <td className="px-2 py-2 align-top">
                {order.fulfillmentType === "PICKUP" ? (
                  <p className="break-words font-semibold text-bone">Recoge en local</p>
                ) : (
                  <>
                    <p className="break-words text-bone">{order.customer.address}</p>
                    <p className="text-xs font-medium text-smoke">{order.customer.neighborhood}</p>
                  </>
                )}
              </td>
              <td className="break-words px-2 py-2 align-top text-bone">
                <span>{order.fulfillmentType === "PICKUP" ? "No aplica" : order.paymentMethod}</span>
                {requiresPaymentProof ? (
                  <span
                    className={[
                      "mt-1 inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-extrabold leading-none",
                      blocksPreparation
                        ? "border-amber-300 bg-amber-50 text-amber-800"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700",
                    ].join(" ")}
                  >
                    {blocksPreparation ? <AlertTriangle className="shrink-0" size={12} /> : <ReceiptText className="shrink-0" size={12} />}
                    <span className="whitespace-nowrap">{blocksPreparation ? "Falta pago" : "Recibido"}</span>
                  </span>
                ) : null}
              </td>
              <td className="px-2 py-2 align-top font-black text-paper">
                {formatCOP(order.total)}
              </td>
              <td className="px-2 py-2 align-top text-xs font-medium text-smoke">{formatDateTime(order.createdAt)}</td>
              <td className="px-2 py-2 align-top">
                <div className="flex flex-wrap justify-end gap-1.5">
                  <Link
                    aria-label={`Ver detalle del pedido ${order.orderNumber}`}
                    className="grid min-h-9 min-w-9 place-items-center rounded-md bg-orange-50 text-bone transition-colors duration-200 hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame"
                    to={`/orders/${order.id}`}
                  >
                    <Eye aria-hidden="true" size={16} />
                  </Link>
                  {order.status !== "CANCELLED" ? (
                    <button
                      aria-label={`Imprimir pedido ${order.orderNumber}`}
                      className="grid min-h-9 min-w-9 place-items-center rounded-md bg-flame text-ink transition-colors duration-200 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame"
                      type="button"
                      onClick={() => onPrint?.(order)}
                    >
                      <Printer aria-hidden="true" size={16} />
                    </button>
                  ) : null}
                  {order.status === "CONFIRMED" ? (
                    <button
                      aria-label={`Aceptar pedido ${order.orderNumber}`}
                      className={[
                        "grid min-h-9 min-w-9 place-items-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2",
                        blocksPreparation
                          ? "bg-zinc-200 text-zinc-500 hover:bg-zinc-300 focus-visible:ring-zinc-300"
                          : "bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-200",
                      ].join(" ")}
                      title={blocksPreparation ? blockedMessage : "Pasar a preparacion"}
                      type="button"
                      onClick={() => {
                        if (blocksPreparation) {
                          onBlockedProof?.(order);
                          return;
                        }
                        onAccept?.(order);
                      }}
                    >
                      <CheckCircle2 aria-hidden="true" size={16} />
                    </button>
                  ) : null}
                  {order.status === "PREPARING" ? (
                    <button
                      aria-label={`Marcar entregado ${order.orderNumber}`}
                      className="grid min-h-9 min-w-9 place-items-center rounded-md bg-sky-600 text-white transition-colors duration-200 hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                      type="button"
                      onClick={() => onDeliver?.(order)}
                    >
                      <PackageCheck aria-hidden="true" size={16} />
                    </button>
                  ) : null}
                  {order.status === "CONFIRMED" ? (
                    <button
                      aria-label={`Cancelar pedido ${order.orderNumber}`}
                      className="grid min-h-9 min-w-9 place-items-center rounded-md bg-ember text-white transition-colors duration-200 hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                      type="button"
                      onClick={() => onReject?.(order)}
                    >
                      <XCircle aria-hidden="true" size={16} />
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
}
