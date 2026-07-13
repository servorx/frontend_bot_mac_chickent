import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getStockControls, updateStockControl } from "../services/stock.service";

export const stockControlKeys = {
  list: ["stock-controls"] as const,
};

export function useStockControls() {
  return useQuery({
    queryKey: stockControlKeys.list,
    queryFn: getStockControls,
  });
}

export function useUpdateStockControl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, isAvailable }: { code: string; isAvailable: boolean }) =>
      updateStockControl(code, isAvailable),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: stockControlKeys.list });
    },
  });
}
