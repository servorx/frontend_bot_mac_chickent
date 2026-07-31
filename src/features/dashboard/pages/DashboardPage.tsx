import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDollarSign, ClipboardList, Printer, Search, X, XCircle } from "lucide-react";

import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { ErrorState } from "../../../shared/components/ErrorState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { Pagination } from "../../../shared/components/Pagination";
import { formatCOP } from "../../../shared/utils/currency";
import { OrderCard } from "../../orders/components/OrderCard";
import { useOrders } from "../../orders/hooks/useOrders";
import { isThermalPrinterEnabled, printThermalDailyProductReport } from "../../orders/services/thermalPrinter.service";
import { filterOrdersBySearch, sortOrdersNewestFirst } from "../../orders/utils/orderFilters";
import { getDailyProductReport, type DailyProductReport } from "../services/operation.service";
import { StatsCard } from "../components/StatsCard";
import { StockControlPanel } from "../components/StockControlPanel";
import { DeliveryAvailabilityPanel } from "../components/DeliveryAvailabilityPanel";
import { calculateDashboardMetrics } from "../utils/dashboardMetrics";

const DASHBOARD_PAGE_SIZE = 3;

export function DashboardPage() {
  const incoming = useOrders("incoming");
  const accepted = useOrders("accepted");
  const rejected = useOrders("rejected");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isPrintingDailyReport, setIsPrintingDailyReport] = useState(false);
  const [dailyReportError, setDailyReportError] = useState("");

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

  const printDailyReport = async () => {
    setIsPrintingDailyReport(true);
    setDailyReportError("");
    try {
      const report = await getDailyProductReport();
      if (isThermalPrinterEnabled()) {
        await printThermalDailyProductReport(report);
      } else {
        printDailyReportInBrowser(report);
      }
    } catch (error) {
      console.error("daily product report print failed", error);
      setDailyReportError(
        error instanceof Error
          ? error.message
          : "No se pudo imprimir el reporte diario. Revisa QZ Tray y vuelve a intentar.",
      );
    } finally {
      setIsPrintingDailyReport(false);
    }
  };

  if (isLoading) {
    return <LoadingState label="Cargando tablero…" />;
  }

  if (isError) {
    return <ErrorState message="No se pudo conectar con los endpoints administrativos." />;
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <section className="ops-surface flex flex-col gap-3 rounded-lg p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-paper">Reporte diario</h2>
          <p className="mt-1 text-sm font-semibold text-smoke">
            Imprime unidades vendidas por producto y total del dia sin incluir domicilios.
          </p>
        </div>
        <Button
          className="w-full lg:w-auto"
          icon={<Printer size={18} />}
          isLoading={isPrintingDailyReport}
          onClick={() => void printDailyReport()}
        >
          Imprimir reporte diario
        </Button>
      </section>

      {dailyReportError ? (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-panel">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-red-100">
            <XCircle size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">No se pudo imprimir el reporte</p>
            <p className="mt-1 text-sm font-semibold">{dailyReportError}</p>
          </div>
          <button
            aria-label="Cerrar aviso"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-red-800 transition hover:bg-red-100"
            type="button"
            onClick={() => setDailyReportError("")}
          >
            <X size={18} />
          </button>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Resumen general">
        <StatsCard
          helper="Hoy"
          icon={ClipboardList}
          title="Pedidos recibidos"
          value={String(metrics.receivedCount)}
        />
        <StatsCard
          helper="Ahora"
          icon={CheckCircle2}
          title="En preparacion"
          value={String(metrics.preparingCount)}
        />
        <StatsCard
          helper="Hoy"
          icon={XCircle}
          title="Cancelados"
          value={String(metrics.cancelledCount)}
        />
        <StatsCard
          helper="Hoy"
          icon={CircleDollarSign}
          title="Venta del dia"
          value={formatCOP(metrics.totalSoldToday)}
        />
      </section>

      <StockControlPanel />

      <DeliveryAvailabilityPanel />

      <section className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="ops-surface flex flex-col gap-3 rounded-lg p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-paper">Pedidos recientes</h2>
            <p className="mt-1 text-sm font-semibold text-smoke">Ultimos pedidos recibidos en tu negocio.</p>
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

function printDailyReportInBrowser(report: DailyProductReport) {
  const lines = [
    "MAX CHICKEN EXPRESS",
    "REPORTE DIARIO",
    `Fecha: ${formatReportDate(report.date)}`,
    "",
    "Producto | Cant | Total",
    "-----------------------",
    ...report.items.map((item, index) => (
      `${index + 1}. ${item.productName} | ${item.quantity} | ${formatCOP(item.totalCop)}`
    )),
    "-----------------------",
    `Unidades: ${report.totalQuantity}`,
    `TOTAL: ${formatCOP(report.totalCop)}`,
    "",
    "SIN DOMICILIOS",
  ];
  const printWindow = window.open("", "_blank", "width=420,height=640");
  if (!printWindow) {
    throw new Error("El navegador bloqueo la ventana de impresion.");
  }
  printWindow.document.write(`
    <html>
      <head>
        <title>Reporte diario</title>
        <style>
          body { font-family: monospace; font-size: 12px; white-space: pre-wrap; padding: 16px; }
        </style>
      </head>
      <body>${escapeHtml(lines.join("\n"))}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function formatReportDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
