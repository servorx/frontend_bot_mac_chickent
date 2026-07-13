import { AlertTriangle, ArrowLeft, CheckCircle2, PackageCheck, Printer, X, XCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "../../../shared/components/Button";
import { ErrorState } from "../../../shared/components/ErrorState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { InvoicePrintModal } from "../components/InvoicePrintModal";
import { OrderConversationPanel } from "../components/OrderConversationPanel";
import { OrderSummary } from "../components/OrderSummary";
import { RejectOrderModal } from "../components/RejectOrderModal";
import { useOrder, useOrderActions } from "../hooks/useOrders";
import type { AdminOrder } from "../types/order.types";
import { printOrderInvoice } from "../utils/printInvoice";

export function OrderDetailPage() {
  const { id = "" } = useParams();
  const orderQuery = useOrder(id);
  const actions = useOrderActions();
  const [orderToReject, setOrderToReject] = useState<AdminOrder | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<AdminOrder | null>(null);
  const [showProofNotice, setShowProofNotice] = useState(false);

  const order = orderQuery.data;
  const backTo = order?.fulfillmentType === "PICKUP" ? "/orders/pickup" : "/orders/incoming";
  const requiresPaymentProof = Boolean(order && order.fulfillmentType === "DELIVERY" && order.paymentProofRequired);
  const blocksPreparation = Boolean(requiresPaymentProof && order?.paymentProofMissing);

  const confirmPrint = async () => {
    if (!orderToPrint) {
      return;
    }
    try {
      await actions.print.mutateAsync(orderToPrint.id);
      setOrderToPrint(null);
    } catch (error) {
      console.error("direct thermal print failed, opening browser fallback", error);
      alert("No se pudo imprimir directo por la impresora termica. Se abrira el metodo de respaldo del navegador.");
      printOrderInvoice(orderToPrint);
      setOrderToPrint(null);
    }
  };

  const confirmReject = async (reason?: string) => {
    if (!orderToReject) {
      return;
    }
    await actions.reject.mutateAsync({ id: orderToReject.id, reason });
    setOrderToReject(null);
  };

  if (orderQuery.isLoading) {
    return <LoadingState label="Cargando detalle…" />;
  }

  if (orderQuery.isError || !order) {
    return (
      <ErrorState
        message="No se pudo cargar este pedido. Verifica tu conexión a internet y vuelve a intentarlo."
        onRetry={() => void orderQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-bone transition-colors duration-200 hover:bg-paper/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame"
          to={backTo}
        >
          <ArrowLeft aria-hidden="true" size={18} />
          Volver
        </Link>
        <div className="flex flex-wrap gap-2">
          {order.status !== "CANCELLED" ? (
            <Button icon={<Printer size={18} />} onClick={() => setOrderToPrint(order)}>
              Imprimir
            </Button>
          ) : null}
          {order.status === "CONFIRMED" ? (
            <Button
              className={[
                blocksPreparation
                  ? "bg-zinc-200 text-zinc-600 shadow-none hover:bg-zinc-300 focus-visible:ring-zinc-300"
                  : "",
              ].join(" ")}
              icon={<CheckCircle2 size={18} />}
              variant="success"
              onClick={() => {
                if (blocksPreparation) {
                  setShowProofNotice(true);
                  return;
                }
                void actions.accept.mutateAsync(order.id);
              }}
            >
              Preparar
            </Button>
          ) : null}
          {order.status === "PREPARING" ? (
            <Button
              icon={<PackageCheck size={18} />}
              variant="success"
              onClick={() => void actions.deliver.mutateAsync(order.id)}
            >
              Entregado
            </Button>
          ) : null}
          {order.status === "CONFIRMED" ? (
            <Button
              icon={<XCircle size={18} />}
              variant="danger"
              onClick={() => setOrderToReject(order)}
            >
              Cancelar
            </Button>
          ) : null}
        </div>
      </div>
      {showProofNotice ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 shadow-panel">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-amber-200 text-amber-900">
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">Falta comprobante de pago</p>
            <p className="mt-1 text-sm font-semibold text-amber-900">
              Este pedido paga por {order.paymentMethod}. Cuando llegue la imagen del comprobante, se habilita el paso a preparacion.
            </p>
          </div>
          <button
            aria-label="Cerrar aviso"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-amber-900 transition hover:bg-amber-100"
            type="button"
            onClick={() => setShowProofNotice(false)}
          >
            <X size={18} />
          </button>
        </div>
      ) : null}
      <OrderSummary order={order} />
      <OrderConversationPanel order={order} />
      <RejectOrderModal
        isLoading={actions.reject.isPending}
        order={orderToReject}
        onClose={() => setOrderToReject(null)}
        onConfirm={confirmReject}
      />
      <InvoicePrintModal
        isLoading={actions.print.isPending}
        order={orderToPrint}
        onClose={() => setOrderToPrint(null)}
        onPrint={() => void confirmPrint()}
      />
    </div>
  );
}
