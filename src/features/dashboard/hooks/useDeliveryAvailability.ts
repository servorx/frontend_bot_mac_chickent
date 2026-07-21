import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getDeliveryAvailability,
  updateDeliveryAvailability,
  type DeliveryAvailability,
} from "../services/operation.service";

export const deliveryAvailabilityKeys = {
  detail: ["delivery-availability"] as const,
};

export function useDeliveryAvailability() {
  return useQuery({
    queryKey: deliveryAvailabilityKeys.detail,
    queryFn: getDeliveryAvailability,
    staleTime: 30_000,
  });
}

export function useUpdateDeliveryAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDeliveryAvailability,
    onMutate: async (deliveryOrdersEnabled) => {
      await queryClient.cancelQueries({ queryKey: deliveryAvailabilityKeys.detail });
      const previous = queryClient.getQueryData<DeliveryAvailability>(deliveryAvailabilityKeys.detail);
      queryClient.setQueryData<DeliveryAvailability>(deliveryAvailabilityKeys.detail, {
        deliveryOrdersEnabled,
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(deliveryAvailabilityKeys.detail, context.previous);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(deliveryAvailabilityKeys.detail, updated);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: deliveryAvailabilityKeys.detail,
        refetchType: "inactive",
      });
    },
  });
}
