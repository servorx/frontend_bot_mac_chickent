import { useMemo } from "react";
import { PackageCheck, PackageX } from "lucide-react";

import { useStockControls, useUpdateStockControl } from "../../catalog/hooks/useStockControls";
import type { StockControl } from "../../catalog/types/stock";

export function StockControlPanel() {
  const stockControls = useStockControls();
  const updateStockControl = useUpdateStockControl();

  const groupedControls = useMemo(() => {
    const groups = new Map<string, StockControl[]>();
    for (const control of stockControls.data ?? []) {
      groups.set(control.groupLabel, [...(groups.get(control.groupLabel) ?? []), control]);
    }
    return Array.from(groups.entries());
  }, [stockControls.data]);

  return (
    <section className="ops-surface rounded-lg p-4" aria-label="Disponibilidad del menu">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="ops-title text-3xl">Disponibilidad</h2>
          <p className="mt-1 text-sm font-medium text-smoke">
            Activa o desactiva productos que el bot puede ofrecer en WhatsApp.
          </p>
        </div>
        {stockControls.isFetching ? (
          <span className="text-xs font-bold uppercase tracking-wide text-smoke">Sincronizando...</span>
        ) : null}
      </div>

      {stockControls.isError ? (
        <p className="mt-4 rounded-md border border-flame/20 bg-flame/10 px-3 py-2 text-sm font-semibold text-flame">
          No se pudo cargar la disponibilidad. Verifica que el bot este encendido.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {groupedControls.map(([groupLabel, controls]) => (
          <div key={groupLabel} className="rounded-md border border-orange-200 bg-white/70 p-3">
            <h3 className="text-sm font-black uppercase tracking-wide text-coffee">{groupLabel}</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {controls.map((control) => {
                const isPending =
                  updateStockControl.isPending && updateStockControl.variables?.code === control.code;
                return (
                  <button
                    key={control.code}
                    className={[
                      "min-h-16 rounded-md border px-3 py-2 text-left transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70",
                      control.isAvailable
                        ? "border-green-300 bg-green-50 text-green-900 hover:border-green-500"
                        : "border-flame/40 bg-flame/10 text-flame hover:border-flame",
                    ].join(" ")}
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      updateStockControl.mutate({
                        code: control.code,
                        isAvailable: !control.isAvailable,
                      })
                    }
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-sm font-black">{control.label}</span>
                      {control.isAvailable ? <PackageCheck size={18} /> : <PackageX size={18} />}
                    </span>
                    <span className="mt-2 block text-xs font-black uppercase tracking-wide">
                      {isPending ? "Guardando..." : control.isAvailable ? "Disponible" : "Agotado"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
