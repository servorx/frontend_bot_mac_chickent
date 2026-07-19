import { useMemo } from "react";
import { Banana, ChefHat, CupSoda, Drumstick, Layers, Utensils } from "lucide-react";

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
    <section className="ops-surface rounded-lg p-4 sm:p-5" aria-label="Disponibilidad del menu">
      <div className="grid gap-4 2xl:grid-cols-[14rem_minmax(0,1fr)] 2xl:items-start">
        <div>
          <h2 className="text-2xl font-black text-paper">Disponibilidad</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-smoke">
            Gestiona la disponibilidad de productos y categorias.
          </p>
          {stockControls.isFetching && !stockControls.data?.length ? (
            <span className="mt-3 inline-flex text-xs font-bold uppercase tracking-wide text-smoke">Sincronizando...</span>
          ) : null}
        </div>

        <div className="min-w-0">
          {stockControls.isError ? (
            <p className="mb-4 rounded-md border border-flame/20 bg-flame/10 px-3 py-2 text-sm font-semibold text-flame">
              No se pudo cargar la disponibilidad. Verifica que el bot este encendido.
            </p>
          ) : null}

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-3">
            {groupedControls.flatMap(([groupLabel, controls]) =>
              controls.map((control) => {
                const isPending =
                  updateStockControl.isPending && updateStockControl.variables?.code === control.code;
                const Icon = iconForControl(`${groupLabel} ${control.label}`);
                return (
                  <button
                    key={control.code}
                    className={[
                      "flex min-h-14 items-center justify-between gap-3 rounded-lg border bg-white px-3 py-3 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70",
                      control.isAvailable
                        ? "border-orange-200 text-paper hover:border-emerald-300 hover:bg-emerald-50/40"
                        : "border-red-200 bg-red-50/60 text-ember hover:border-ember",
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
                    <span className="flex min-w-0 items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#fff2d8] text-ember">
                          <Icon size={19} />
                        </span>
                        <span className="min-w-0">
                          <span className="block break-words text-sm font-extrabold leading-4">{control.label}</span>
                          <span className="mt-1 block break-words text-[10px] font-bold uppercase leading-3 tracking-wide text-smoke">
                            {groupLabel}
                          </span>
                        </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={[
                        "relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors",
                        control.isAvailable ? "bg-[#58a33c]" : "bg-red-300",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "block size-5 rounded-full bg-white shadow-sm transition-transform",
                          control.isAvailable ? "translate-x-5" : "translate-x-0",
                        ].join(" ")}
                      />
                    </span>
                    <span className="sr-only">
                      {isPending ? "Guardando" : control.isAvailable ? "Disponible" : "Agotado"}
                    </span>
                  </button>
                );
              }),
            )}
            {!groupedControls.length && !stockControls.isFetching ? (
              <p className="rounded-lg border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-smoke">
                No hay controles de disponibilidad configurados.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function iconForControl(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("maduro") || normalized.includes("platano") || normalized.includes("plátano")) return Banana;
  if (normalized.includes("lasagna") || normalized.includes("lasaña") || normalized.includes("lasana")) return Layers;
  if (normalized.includes("bebida") || normalized.includes("gaseosa")) return CupSoda;
  if (normalized.includes("broaster") || normalized.includes("pierna")) return Drumstick;
  if (normalized.includes("asado") || normalized.includes("pollo")) return ChefHat;
  if (normalized.includes("adicional") || normalized.includes("papas") || normalized.includes("salsa")) return Utensils;
  return Utensils;
}
