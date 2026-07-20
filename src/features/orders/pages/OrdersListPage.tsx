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
import { isThermalPrinterEnabled, printThermalOrder } from "../services/thermalPrinter.service";
import type { AdminOrder, OrderListKind } from "../types/order.types";
import { filterOrdersBySearch, sortOrdersNewestFirst } from "../utils/orderFilters";
import { printOrderInvoice } from "../utils/printInvoice";

const ORDERS_PAGE_SIZE = 4;
type OrderFilter = "ALL" | "DELIVERY" | "PICKUP" | "PREPARING";

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
  const preparingOrdersQuery = useOrders("accepted");
  const actions = useOrderActions();
  const [orderToReject, setOrderToReject] = useState<AdminOrder | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<AdminOrder | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState("");
  const [blockedProofOrder, setBlockedProofOrder] = useState<AdminOrder | null>(null);
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("ALL");
  const [page, setPage] = useState(1);
  const incomingSound = useIncomingOrderSound();
  const sourceOrders = useMemo(
    () => (kind === "incoming" ? [...(ordersQuery.data ?? []), ...(preparingOrdersQuery.data ?? [])] : ordersQuery.data ?? []),
    [kind, ordersQuery.data, preparingOrdersQuery.data],
  );
  const filteredOrders = useMemo(
    () =>
      filterOrdersBySearch(
        sortOrdersNewestFirst(sourceOrders).filter((order) => {
          if (orderFilter === "ALL") return true;
          if (orderFilter === "PREPARING") return order.status === "PREPARING";
          return order.fulfillmentType === orderFilter;
        }),
        search,
      ),
    [orderFilter, search, sourceOrders],
  );
  const isLoading = ordersQuery.isLoading || (kind === "incoming" && preparingOrdersQuery.isLoading);
  const isError = ordersQuery.isError || (kind === "incoming" && preparingOrdersQuery.isError);
  const hasData = Boolean(ordersQuery.data) && (kind !== "incoming" || Boolean(preparingOrdersQuery.data));
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
  }, [orderFilter, search, orderSignature]);

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
      setPrintError(error instanceof Error ? error.message : "No se pudo imprimir por QZ. Revisa QZ Tray y vuelve a intentar.");
    } finally {
      setIsPrinting(false);
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
      <header className="ops-surface flex flex-col gap-4 rounded-lg p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block w-full lg:max-w-xl">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-smoke"
              size={18}
            />
            <span className="sr-only">Buscar pedidos</span>
            <input
              className="min-h-12 w-full rounded-lg border border-orange-200 bg-white pl-12 pr-3 text-sm font-semibold text-paper outline-none transition-colors duration-200 placeholder:text-smoke focus:border-flame focus:ring-2 focus:ring-flame/30"
              placeholder="Buscar por numero de pedido, cliente o telefono..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {([
              ["ALL", "Todos"],
              ["DELIVERY", "Domicilio"],
              ["PICKUP", "Recoger"],
              ...(kind === "incoming" ? ([["PREPARING", "Preparando"]] as const) : []),
            ] as const).map(([value, label]) => (
              <button
                className={[
                  "min-h-11 rounded-lg border px-5 text-sm font-extrabold transition-colors",
                  orderFilter === value
                    ? "border-ember bg-ember text-white shadow-[0_10px_22px_rgba(201,31,20,0.16)]"
                    : "border-orange-200 bg-white text-bone hover:bg-orange-50",
                ].join(" ")}
                key={value}
                type="button"
                onClick={() => setOrderFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
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
      </header>

      {isLoading ? <LoadingState label="Cargando pedidos…" /> : null}
      {isError ? (
        <ErrorState
          message="Revisa que el software administrativo este corriendo en y que tu sesion este activa."
          onRetry={() => {
            void ordersQuery.refetch();
            if (kind === "incoming") {
              void preparingOrdersQuery.refetch();
            }
          }}
        />
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
      {hasData && filteredOrders.length === 0 ? (
        <EmptyState message={emptyMessage} title={emptyTitle} />
      ) : null}
      {hasData && filteredOrders.length > 0 ? (
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
