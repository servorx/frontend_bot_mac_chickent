import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getStockControls, updateStockControl } from "../services/stock.service";
import type { StockControl } from "../types/stock";

export const stockControlKeys = {
  list: ["stock-controls"] as const,
};

export function useStockControls() {
  return useQuery({
    queryKey: stockControlKeys.list,
    queryFn: getStockControls,
    staleTime: 60_000,
  });
}

export function useUpdateStockControl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, isAvailable }: { code: string; isAvailable: boolean }) =>
      updateStockControl(code, isAvailable),
    onMutate: async ({ code, isAvailable }) => {
      await queryClient.cancelQueries({ queryKey: stockControlKeys.list });
      const previous = queryClient.getQueryData<StockControl[]>(stockControlKeys.list);
      queryClient.setQueryData<StockControl[]>(stockControlKeys.list, (current) =>
        (current ?? []).map((control) => (control.code === code ? { ...control, isAvailable } : control)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(stockControlKeys.list, context.previous);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<StockControl[]>(stockControlKeys.list, (current) =>
        (current ?? []).map((control) => (control.code === updated.code ? updated : control)),
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: stockControlKeys.list, refetchType: "inactive" });
    },
  });
}
