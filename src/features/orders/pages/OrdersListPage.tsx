import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Search, X } from "lucide-react";

import { EmptyState } from "../../../shared/components/EmptyState";
import { ErrorState } from "../../../shared/components/ErrorState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { Pagination } from "../../../shared/components/Pagination";
import { InvoicePrintModal } from "../components/InvoicePrintModal";
import { OrderCard } from "../components/OrderCard";
import { OrdersTable } from "../components/OrdersTable";
import { RejectOrderModal } from "../components/RejectOrderModal";
import { useIncomingOrderSound } from "../hooks/useIncomingOrderSound";
import { useOrderActions, useOrders } from "../hooks/useOrders";
import { printThermalOrder } from "../services/thermalPrinter.service";
import type { AdminOrder, OrderListKind } from "../types/order.types";
import { filterOrdersBySearch, sortOrdersNewestFirst } from "../utils/orderFilters";
import { printOrderInvoice } from "../utils/printInvoice";

const ORDERS_PAGE_SIZE = 4;

type OrdersListPageProps = {
  kind: OrderListKind;
  title: string;
  emptyTitle: string;
  emptyMessage: string;
};

export function OrdersListPage({
  kind,
  title,
  emptyTitle,
  emptyMessage,
}: OrdersListPageProps) {
  const ordersQuery = useOrders(kind);
  const actions = useOrderActions();
  const [orderToReject, setOrderToReject] = useState<AdminOrder | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<AdminOrder | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [blockedProofOrder, setBlockedProofOrder] = useState<AdminOrder | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const incomingSound = useIncomingOrderSound(kind === "incoming" ? ordersQuery.data : undefined);
  const filteredOrders = useMemo(
    () => filterOrdersBySearch(sortOrdersNewestFirst(ordersQuery.data ?? []), search),
    [ordersQuery.data, search],
  );
  const orderSignature = useMemo(
    () => filteredOrders.map((order) => `${order.id}:${order.createdAt}:${order.status}:${order.total}`).join("|"),
    [filteredOrders],
  );
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PAGE_SIZE,
    currentPage * ORDERS_PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, orderSignature]);

  const confirmPrint = async () => {
    if (!orderToPrint) {
      return;
    }
    setIsPrinting(true);
    try {
      await printThermalOrder(orderToPrint);
    } catch (error) {
      console.error("qz thermal print failed, opening browser fallback", error);
      printOrderInvoice(orderToPrint);
    } finally {
      setIsPrinting(false);
      setOrderToPrint(null);
    }
  };

  const acceptOrder = async (order: AdminOrder) => {
    await actions.accept.mutateAsync(order.id);
  };

  const deliverOrder = async (order: AdminOrder) => {
    await actions.deliver.mutateAsync(order.id);
  };

  const confirmReject = async (reason?: string) => {
    if (!orderToReject) {
      return;
    }
    await actions.reject.mutateAsync({ id: orderToReject.id, reason });
    setOrderToReject(null);
  };

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <header className="ops-surface flex flex-col gap-3 rounded-lg p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="ops-title text-5xl">{title}</h1>
          {kind === "incoming" ? (
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "w-fit rounded-full border px-3 py-1.5 text-xs font-extrabold",
                  incomingSound.isEnabled
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-flame/50 bg-flame/10 text-ember",
                ].join(" ")}
              >
                {incomingSound.isEnabled
                  ? "Sonido automatico activo"
                  : "Sonido automatico listo al primer clic"}
              </span>
              <button
                className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-extrabold text-ember transition-colors duration-200 hover:bg-orange-50"
                type="button"
                onClick={incomingSound.test}
              >
                Probar sonido
              </button>
            </div>
          ) : null}
        </div>
        <label className="relative block w-full lg:max-w-sm">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-smoke"
            size={18}
          />
          <span className="sr-only">Buscar pedidos</span>
          <input
            className="min-h-11 w-full rounded-md border border-orange-200 bg-white pl-10 pr-3 text-sm font-semibold text-paper outline-none transition-colors duration-200 placeholder:text-smoke focus:border-flame focus:ring-2 focus:ring-flame/30"
            placeholder="Buscar cliente, barrio, pedido..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </header>

      {ordersQuery.isLoading ? <LoadingState label="Cargando pedidos…" /> : null}
      {ordersQuery.isError ? (
        <ErrorState message="Revisa que el software administrativo este corriendo en y que tu sesion este activa." onRetry={() => void ordersQuery.refetch()} />
      ) : null}
      {blockedProofOrder ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 shadow-panel">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-amber-200 text-amber-900">
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">Falta comprobante de pago</p>
            <p className="mt-1 text-sm font-semibold text-amber-900">
              El pedido {blockedProofOrder.orderNumber} paga por {blockedProofOrder.paymentMethod}. Primero debe llegar
              el comprobante para pasarlo a preparacion.
            </p>
          </div>
          <button
            aria-label="Cerrar aviso"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-amber-900 transition hover:bg-amber-100"
            type="button"
            onClick={() => setBlockedProofOrder(null)}
          >
            <X size={18} />
          </button>
        </div>
      ) : null}
      {ordersQuery.data && filteredOrders.length === 0 ? (
        <EmptyState message={emptyMessage} title={emptyTitle} />
      ) : null}
      {ordersQuery.data && filteredOrders.length > 0 ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="hidden lg:block">
            <OrdersTable
              orders={visibleOrders}
              onAccept={(order) => void acceptOrder(order)}
              onBlockedProof={setBlockedProofOrder}
              onDeliver={(order) => void deliverOrder(order)}
              onPrint={setOrderToPrint}
              onReject={setOrderToReject}
            />
          </div>
          <div className="grid content-start gap-3 lg:hidden">
            {visibleOrders.map((order) => (
              <OrderCard
                compact
                key={order.id}
                order={order}
                onAccept={(selectedOrder) => void acceptOrder(selectedOrder)}
                onBlockedProof={setBlockedProofOrder}
                onDeliver={(selectedOrder) => void deliverOrder(selectedOrder)}
                onPrint={setOrderToPrint}
                onReject={setOrderToReject}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            label="Pedidos encontrados"
            pageCount={pageCount}
            totalItems={filteredOrders.length}
            onPageChange={setPage}
          />
        </div>
      ) : null}

      <RejectOrderModal
        isLoading={actions.reject.isPending}
        order={orderToReject}
        onClose={() => setOrderToReject(null)}
        onConfirm={confirmReject}
      />
      <InvoicePrintModal
        isLoading={isPrinting}
        order={orderToPrint}
        onClose={() => setOrderToPrint(null)}
        onPrint={() => void confirmPrint()}
      />
    </div>
  );
}
