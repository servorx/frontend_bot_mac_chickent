import { AlertTriangle } from "lucide-react";

import { Button } from "./Button";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-paper" role="alert">
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-1 text-ember" size={22} />
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold">No se pudo cargar</h2>
          <p className="mt-1 break-words text-sm leading-6 text-red-800">{message}</p>
          {onRetry ? (
            <Button className="mt-4" variant="secondary" onClick={onRetry}>
              Reintentar
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
