export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border border-orange-200 bg-white/70">
      <div className="text-center" aria-live="polite">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-flame border-t-transparent" />
        <p className="text-sm font-medium text-bone">{label}</p>
      </div>
    </div>
  );
}
