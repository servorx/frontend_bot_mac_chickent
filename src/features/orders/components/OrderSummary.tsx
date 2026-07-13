import { Badge } from "../../../shared/components/Badge";
import { Card } from "../../../shared/components/Card";
import { formatCOP } from "../../../shared/utils/currency";
import { formatDateTime } from "../../../shared/utils/date";
import type { AdminOrder } from "../types/order.types";

export function OrderSummary({ order }: { order: AdminOrder }) {
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge status={order.status} />
            <h1 className="ops-title mt-3 text-4xl" translate="no">
              {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-smoke">{formatDateTime(order.createdAt)}</p>
          </div>
          <p className="text-4xl font-black text-paper">{formatCOP(order.total)}</p>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Card className="p-5">
          <h2 className="ops-title text-2xl">Cliente</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Detail label="Nombre" value={order.customer.fullName} />
            <Detail label="Telefono" value={order.customer.phone} />
            <Detail label="Tipo de pedido" value={order.fulfillmentType === "PICKUP" ? "Recoge en local" : "Domicilio"} />
            {order.fulfillmentType === "DELIVERY" ? (
              <>
                <Detail label="Direccion" value={order.customer.address} />
                <Detail label="Barrio" value={order.customer.neighborhood} />
                <Detail label="Pago" value={order.paymentMethod} />
              </>
            ) : null}
            {order.fulfillmentType === "DELIVERY" && order.paymentProofRequired ? (
              <div>
                <dt className="text-xs uppercase text-smoke">Comprobante</dt>
                <dd
                  className={[
                    "mt-1 w-fit rounded-full border px-3 py-1 text-xs font-extrabold",
                    order.paymentProofMissing
                      ? "border-zinc-200 bg-zinc-100 text-zinc-600"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700",
                  ].join(" ")}
                >
                  {order.paymentProofMissing ? "Pendiente" : "Recibido"}
                </dd>
              </div>
            ) : null}
            <Detail label="Observaciones" value={order.observations || "Sin observaciones"} />
            {order.rejectionReason ? <Detail label="Motivo rechazo" value={order.rejectionReason} /> : null}
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="ops-title text-2xl">Productos</h2>
          <div className="mt-4 divide-y divide-orange-100">
            {order.items.map((item) => (
              <div className="grid grid-cols-[1fr_auto] gap-4 py-3" key={item.id}>
                <div className="min-w-0">
                  <p className="break-words font-semibold text-paper">{item.productName}</p>
                  <p className="text-sm text-smoke">
                    {item.quantity} x {formatCOP(item.unitPrice)}
                  </p>
                </div>
                <p className="font-display font-semibold text-bone">{formatCOP(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-orange-100 pt-4 text-sm">
            <TotalLine label="Subtotal" value={order.subtotal} />
            <TotalLine label={order.fulfillmentType === "PICKUP" ? "Recogida" : "Domicilio"} value={order.deliveryFee} />
            <TotalLine label="Total" value={order.total} strong />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-smoke">{label}</dt>
      <dd className="mt-1 break-words text-bone">{value}</dd>
    </div>
  );
}

function TotalLine({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className={strong ? "font-semibold text-paper" : "text-bone"}>{label}</span>
      <span className={strong ? "font-display text-xl font-bold text-paper" : "font-display text-bone"}>
        {formatCOP(value)}
      </span>
    </div>
  );
}
