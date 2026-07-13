import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  acceptOrder,
  getOrder,
  getOrders,
  rejectOrder,
  updateOrderStatus,
} from "../services/order.service";
import type { OrderListKind } from "../types/order.types";

const orderKeys = {
  all: ["orders"] as const,
  list: (kind: OrderListKind) => ["orders", kind] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
};

export function useOrders(kind: OrderListKind) {
  return useQuery({
    queryKey: orderKeys.list(kind),
    queryFn: () => getOrders(kind),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrder(id),
  });
}

export function useOrderActions() {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: orderKeys.all });
  };

  const accept = useMutation({
    mutationFn: acceptOrder,
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectOrder(id, reason),
    onSuccess: invalidate,
  });

  const deliver = useMutation({
    mutationFn: (id: string) => updateOrderStatus(id, "DELIVERED"),
    onSuccess: invalidate,
  });

  return { accept, reject, deliver };
}
