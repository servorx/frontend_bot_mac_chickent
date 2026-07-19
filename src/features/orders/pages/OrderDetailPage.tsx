import { AlertTriangle, ArrowLeft, CheckCircle2, PackageCheck, Printer, X, XCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "../../../shared/components/Button";
import { Badge } from "../../../shared/components/Badge";
import { ErrorState } from "../../../shared/components/ErrorState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { formatCOP } from "../../../shared/utils/currency";
import { formatDateTime } from "../../../shared/utils/date";
import { InvoicePrintModal } from "../components/InvoicePrintModal";
import { OrderConversationPanel } from "../components/OrderConversationPanel";
import { OrderSummary } from "../components/OrderSummary";
import { RejectOrderModal } from "../components/RejectOrderModal";
import { useOrder, useOrderActions } from "../hooks/useOrders";
import { isThermalPrinterEnabled, printThermalOrder } from "../services/thermalPrinter.service";
import type { AdminOrder } from "../types/order.types";
import { printOrderInvoice } from "../utils/printInvoice";

export function OrderDetailPage() {
  const { id = "" } = useParams();
  const orderQuery = useOrder(id);
  const actions = useOrderActions();
  const [orderToReject, setOrderToReject] = useState<AdminOrder | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<AdminOrder | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState("");
  const [showProofNotice, setShowProofNotice] = useState(false);

  const order = orderQuery.data;
  const backTo = order?.fulfillmentType === "PICKUP" ? "/orders/pickup" : "/orders/incoming";
  const requiresPaymentProof = Boolean(order && order.fulfillmentType === "DELIVERY" && order.paymentProofRequired);
  const blocksPreparation = Boolean(requiresPaymentProof && order?.paymentProofMissing);

  const confirmPrint = async () => {
    if (!orderToPrint) {
      return;
    }
    if (!isThermalPrinterEnabled()) {
      printOrderInvoice(orderToPrint);
      setOrderToPrint(null);
      return;
    }
    setIsPrinting(true);
    setPrintError("");
    try {
      await printThermalOrder(orderToPrint);
      setOrderToPrint(null);
    } catch (error) {
      console.error("qz thermal print failed", error);
      setPrintError("No se pudo imprimir por QZ. Revisa que QZ Tray este abierto y que la impresora MCCHICKEN este disponible.");
    } finally {
      setIsPrinting(false);
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
      <div className="ops-surface flex flex-col gap-5 rounded-lg p-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md border border-orange-200 bg-white px-3 text-sm font-extrabold text-bone transition-colors duration-200 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame"
            to={backTo}
          >
            <ArrowLeft aria-hidden="true" size={18} />
            Volver
          </Link>
          <div className="min-w-0 border-orange-200 sm:border-l sm:pl-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-all text-3xl font-black text-paper" translate="no">{order.orderNumber}</h1>
              <Badge status={order.status} />
            </div>
            <p className="mt-1 text-sm font-semibold text-smoke">Realizado {formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center 2xl:grid-cols-[auto_auto]">
          <div className="border-orange-200 lg:border-l lg:px-8">
            <p className="text-sm font-semibold text-bone">Total del pedido</p>
            <p className="text-3xl font-black text-paper">{formatCOP(order.total)}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end">
          {order.status !== "CANCELLED" ? (
            <Button className="w-full bg-flame text-ink hover:bg-yellow-300 xl:w-auto" icon={<Printer size={18} />} onClick={() => setOrderToPrint(order)}>
              Imprimir pedido
            </Button>
          ) : null}
          {order.status === "CONFIRMED" ? (
            <Button
              className={[
                "w-full xl:w-auto",
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
              Pasar a preparacion
            </Button>
          ) : null}
          {order.status === "PREPARING" ? (
            <Button
              className="w-full xl:w-auto"
              icon={<PackageCheck size={18} />}
              variant="success"
              onClick={() => void actions.deliver.mutateAsync(order.id)}
            >
              Entregado
            </Button>
          ) : null}
          {order.status === "CONFIRMED" ? (
            <Button
              className="w-full xl:w-auto"
              icon={<XCircle size={18} />}
              variant="danger"
              onClick={() => setOrderToReject(order)}
            >
              Cancelar pedido
            </Button>
          ) : null}
          </div>
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
        errorMessage={printError}
        isLoading={isPrinting}
        order={orderToPrint}
        onClose={() => {
          setOrderToPrint(null);
          setPrintError("");
        }}
        onPrint={() => void confirmPrint()}
      />
    </div>
  );
}
