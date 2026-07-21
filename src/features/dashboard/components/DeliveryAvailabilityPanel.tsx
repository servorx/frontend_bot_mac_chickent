import { Bike, Loader2, Power } from "lucide-react";

import {
  useDeliveryAvailability,
  useUpdateDeliveryAvailability,
} from "../hooks/useDeliveryAvailability";

export function DeliveryAvailabilityPanel() {
  const availability = useDeliveryAvailability();
  const updateAvailability = useUpdateDeliveryAvailability();
  const enabled = availability.data?.deliveryOrdersEnabled ?? true;
  const isBusy = availability.isFetching || updateAvailability.isPending;

  return (
    <section className="ops-surface rounded-lg p-4 sm:p-5" aria-label="Estado de domicilios">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={[
              "grid size-11 shrink-0 place-items-center rounded-md",
              enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-ember",
            ].join(" ")}
          >
            <Bike size={22} />
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl font-black text-paper">Domicilios</h2>
            <p className="mt-1 text-sm font-semibold leading-5 text-smoke">
              {enabled
                ? "El bot esta recibiendo pedidos a domicilio."
                : "El bot esta rechazando domicilios e invitando a recoger en el local."}
            </p>
            {availability.isError ? (
              <p className="mt-2 rounded-md border border-flame/20 bg-flame/10 px-3 py-2 text-sm font-semibold text-flame">
                No se pudo cargar el estado de domicilios.
              </p>
            ) : null}
          </div>
        </div>

        <button
          className={[
            "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-black transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto",
            enabled
              ? "border-red-200 bg-red-50 text-ember hover:border-ember"
              : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-500",
          ].join(" ")}
          type="button"
          disabled={isBusy}
          onClick={() => updateAvailability.mutate(!enabled)}
        >
          {updateAvailability.isPending ? <Loader2 className="animate-spin" size={18} /> : <Power size={18} />}
          {enabled ? "Deshabilitar domicilios" : "Habilitar domicilios"}
        </button>
      </div>
    </section>
  );
}
