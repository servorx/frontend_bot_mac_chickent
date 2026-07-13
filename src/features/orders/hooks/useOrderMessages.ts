import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getOrderMessages, sendOrderMessage, type SendOrderMessagePayload } from "../services/conversation.service";

const messageKeys = {
  detail: (orderId: string) => ["order-messages", orderId] as const,
};

export function useOrderMessages(orderId: string) {
  return useQuery({
    queryKey: messageKeys.detail(orderId),
    queryFn: () => getOrderMessages(orderId),
    enabled: Boolean(orderId),
  });
}

export function useSendOrderMessage(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendOrderMessagePayload) => sendOrderMessage(orderId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: messageKeys.detail(orderId) });
    },
  });
}
