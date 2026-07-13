import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDollarSign, ClipboardList, Search, XCircle } from "lucide-react";

import { EmptyState } from "../../../shared/components/EmptyState";
import { ErrorState } from "../../../shared/components/ErrorState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { Pagination } from "../../../shared/components/Pagination";
import { formatCOP } from "../../../shared/utils/currency";
import { OrderCard } from "../../orders/components/OrderCard";
import { useOrders } from "../../orders/hooks/useOrders";
import { filterOrdersBySearch, sortOrdersNewestFirst } from "../../orders/utils/orderFilters";
import { StatsCard } from "../components/StatsCard";
import { StockControlPanel } from "../components/StockControlPanel";
import { calculateDashboardMetrics } from "../utils/dashboardMetrics";

const DASHBOARD_PAGE_SIZE = 1;

export function DashboardPage() {
  const incoming = useOrders("incoming");
  const accepted = useOrders("accepted");
  const rejected = useOrders("rejected");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const isLoading = incoming.isLoading || accepted.isLoading || rejected.isLoading;
  const isError = incoming.isError || accepted.isError || rejected.isError;
  const metrics = calculateDashboardMetrics({
    incoming: incoming.data ?? [],
    accepted: accepted.data ?? [],
    rejected: rejected.data ?? [],
  });
  const activeOrders = useMemo(
    () => [...(incoming.data ?? []), ...(accepted.data ?? [])],
    [incoming.data, accepted.data],
  );
  const filteredRecentOrders = useMemo(
    () => filterOrdersBySearch(sortOrdersNewestFirst(activeOrders), search),
    [activeOrders, search],
  );
  const incomingOrderSignature = useMemo(
    () => filteredRecentOrders.map((order) => `${order.id}:${order.createdAt}:${order.status}:${order.total}`).join("|"),
    [filteredRecentOrders],
  );
  const pageCount = Math.max(1, Math.ceil(filteredRecentOrders.length / DASHBOARD_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const latestOrders = filteredRecentOrders.slice(
    (currentPage - 1) * DASHBOARD_PAGE_SIZE,
    currentPage * DASHBOARD_PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, incomingOrderSignature]);

  if (isLoading) {
    return <LoadingState label="Cargando tablero…" />;
  }

  if (isError) {
    return <ErrorState message="No se pudo conectar con los endpoints administrativos." />;
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Resumen general">
        <StatsCard
          helper="Pendientes de imprimir"
          icon={ClipboardList}
          title="Recibidos"
          value={String(metrics.receivedCount)}
        />
        <StatsCard
          helper="Pedidos en cocina"
          icon={CheckCircle2}
          title="Preparando"
          value={String(metrics.preparingCount)}
        />
        <StatsCard
          helper="Pedidos cancelados"
          icon={XCircle}
          title="Cancelados"
          value={String(metrics.cancelledCount)}
        />
        <StatsCard
          helper="Pedidos de hoy no cancelados"
          icon={CircleDollarSign}
          title="Total Vendido"
          value={formatCOP(metrics.totalSoldToday)}
        />
      </section>

      <StockControlPanel />

      <section className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="ops-surface flex flex-col gap-3 rounded-lg p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="ops-title text-3xl">Ultimos pedidos</h2>
            <p className="mt-1 text-sm font-medium text-smoke">Recibidos, en cocina y entregados del mas nuevo al mas antiguo.</p>
          </div>
          <label className="relative block w-full lg:max-w-sm">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-smoke"
              size={18}
            />
            <span className="sr-only">Buscar pedidos recibidos</span>
            <input
              className="min-h-11 w-full rounded-md border border-orange-200 bg-white pl-10 pr-3 text-sm font-semibold text-paper outline-none transition-colors duration-200 placeholder:text-smoke focus:border-flame focus:ring-2 focus:ring-flame/30"
              placeholder="Buscar cliente, barrio, telefono..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {latestOrders.length ? (
          <div className="grid min-h-0 flex-1 content-start gap-3">
            {latestOrders.map((order) => (
              <OrderCard compact key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState
            message="Cuando el bot confirme un pedido, se mostrara aqui automaticamente."
            title="Sin pedidos recientes"
          />
        )}
        <Pagination
          currentPage={currentPage}
          label="Pedidos encontrados"
          pageCount={pageCount}
          totalItems={filteredRecentOrders.length}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}
