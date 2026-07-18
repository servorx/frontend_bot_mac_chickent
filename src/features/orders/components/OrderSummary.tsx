import type { LucideIcon } from "lucide-react";
import { CreditCard, Home, MapPin, MessageSquareText, Phone, UserRound } from "lucide-react";

import { Card } from "../../../shared/components/Card";
import { formatCOP } from "../../../shared/utils/currency";
import type { AdminOrder } from "../types/order.types";

export function OrderSummary({ order }: { order: AdminOrder }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Card className="p-6">
          <h2 className="text-2xl font-black text-ember">Cliente</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <Detail icon={UserRound} label="Nombre" value={order.customer.fullName} />
            <Detail icon={Phone} label="Telefono" value={order.customer.phone} />
            <Detail icon={Home} label="Tipo de pedido" value={order.fulfillmentType === "PICKUP" ? "Recoger" : "Domicilio"} />
            {order.fulfillmentType === "DELIVERY" ? (
              <>
                <Detail icon={MapPin} label="Direccion" value={`${order.customer.address}, ${order.customer.neighborhood}`} />
                <Detail icon={CreditCard} label="Metodo de pago" value={order.paymentMethod} />
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
            <Detail icon={MessageSquareText} label="Observaciones" value={order.observations || "Sin observaciones"} />
            {order.rejectionReason ? <Detail icon={MessageSquareText} label="Motivo rechazo" value={order.rejectionReason} /> : null}
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-black text-ember">Productos</h2>
          <div className="mt-5 overflow-x-auto rounded-lg border border-orange-100">
            <div className="min-w-[36rem]">
              <div className="grid grid-cols-[minmax(0,1fr)_5rem_7rem_7rem] gap-4 bg-[#fff2d8] px-4 py-3 text-xs font-black uppercase text-paper">
                <span>Producto</span>
                <span className="text-center">Cant.</span>
                <span className="text-right">Precio</span>
                <span className="text-right">Subtotal</span>
              </div>
              {order.items.map((item) => (
                <div className="grid grid-cols-[minmax(0,1fr)_5rem_7rem_7rem] gap-4 border-t border-orange-100 px-4 py-3 text-sm" key={item.id}>
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-paper">{item.productName}</p>
                  </div>
                  <p className="text-center font-semibold text-bone">{item.quantity}</p>
                  <p className="text-right font-semibold text-bone">{formatCOP(item.unitPrice)}</p>
                  <p className="text-right font-semibold text-paper">{formatCOP(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="ml-auto mt-5 max-w-sm space-y-2 text-sm">
            <TotalLine label="Subtotal" value={order.subtotal} />
            <TotalLine label={order.fulfillmentType === "PICKUP" ? "Recogida" : "Domicilio"} value={order.deliveryFee} />
            <TotalLine label="Total" value={order.total} strong />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1.4rem_8rem_minmax(0,1fr)] gap-3">
      <Icon className="mt-0.5 text-bone" size={18} />
      <dt className="font-semibold text-paper">{label}</dt>
      <dd className="break-words font-semibold text-bone">{value}</dd>
    </div>
  );
}

function TotalLine({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className={strong ? "font-semibold text-paper" : "text-bone"}>{label}</span>
      <span className={strong ? "text-xl font-black text-ember" : "font-semibold text-paper"}>
        {formatCOP(value)}
      </span>
    </div>
  );
}
