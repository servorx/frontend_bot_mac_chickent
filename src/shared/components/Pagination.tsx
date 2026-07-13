import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  pageCount: number;
  totalItems: number;
  label: string;
  className?: string;
  onPageChange: (page: number) => void;
};

export function Pagination({
  currentPage,
  pageCount,
  totalItems,
  label,
  className = "",
  onPageChange,
}: PaginationProps) {
  const canGoBack = currentPage > 1;
  const canGoNext = currentPage < pageCount;

  if (pageCount <= 1 && totalItems === 0) {
    return null;
  }

  return (
    <div
      className={[
        "sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-bone shadow-panel",
        className,
      ].join(" ")}
    >
      <p className="font-semibold">
        {label}: <span className="text-paper">{totalItems}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          aria-label="Pagina anterior"
          className="grid min-h-9 min-w-9 place-items-center rounded-md border border-orange-200 bg-white text-paper transition-colors duration-200 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!canGoBack}
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft aria-hidden="true" size={18} />
        </button>
        <span className="min-w-20 text-center text-xs font-extrabold uppercase tracking-wide text-smoke">
          {currentPage} / {Math.max(pageCount, 1)}
        </span>
        <button
          aria-label="Pagina siguiente"
          className="grid min-h-9 min-w-9 place-items-center rounded-md border border-orange-200 bg-white text-paper transition-colors duration-200 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!canGoNext}
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>
    </div>
  );
}
