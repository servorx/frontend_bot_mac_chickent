import { Inbox } from "lucide-react";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-orange-200 bg-white/70 p-8 text-center">
      <Inbox aria-hidden="true" className="mx-auto mb-3 text-smoke" size={36} />
      <h2 className="font-display text-lg font-semibold text-paper">{title}</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-bone">{message}</p>
    </div>
  );
}
