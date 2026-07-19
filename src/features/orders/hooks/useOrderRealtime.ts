import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { env } from "../../../config/env";

export const INCOMING_ORDER_CREATED_EVENT = "asadero:incoming-order-created";

export function useOrderRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let stopped = false;
    let didInitialSync = false;
    let reconnectDelayMs = 2000;

    const connect = () => {
      socket = new WebSocket(env.wsBaseUrl);
      socket.onopen = () => {
        reconnectDelayMs = 2000;
        if (!didInitialSync) {
          didInitialSync = true;
          void queryClient.invalidateQueries();
        }
      };
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            type?: string;
            chatId?: string;
            orderId?: string;
            status?: string;
            fulfillmentType?: string;
          };
          if (
            payload.type === "orders.created" &&
            payload.status === "CONFIRMED" &&
            payload.fulfillmentType === "DELIVERY"
          ) {
            window.dispatchEvent(new CustomEvent(INCOMING_ORDER_CREATED_EVENT, { detail: payload }));
          }
          if (payload.type === "orders.changed") {
            void queryClient.invalidateQueries({ queryKey: ["orders"] });
            void queryClient.invalidateQueries({ queryKey: ["orders", "detail"] });
            void queryClient.refetchQueries({ queryKey: ["orders"], type: "active" });
          }
          if (payload.type === "catalog.changed") {
            void queryClient.invalidateQueries({ queryKey: ["stock-controls"], refetchType: "inactive" });
          }
          if (payload.type === "conversations.changed") {
            void queryClient.invalidateQueries({ queryKey: ["order-messages"] });
            void queryClient.invalidateQueries({ queryKey: ["chats"] });
            void queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
            void queryClient.invalidateQueries({ queryKey: ["chat-control"] });
            if (payload.chatId) {
              void queryClient.invalidateQueries({ queryKey: ["chat-messages", payload.chatId] });
              void queryClient.refetchQueries({ queryKey: ["chat-messages", payload.chatId], type: "active" });
            }
            if (payload.orderId) {
              void queryClient.invalidateQueries({ queryKey: ["order-messages", payload.orderId] });
              void queryClient.refetchQueries({ queryKey: ["order-messages", payload.orderId], type: "active" });
            }
            void queryClient.refetchQueries({ queryKey: ["chats"], type: "active" });
          }
        } catch {
          // Ignore malformed realtime payloads.
        }
      };
      socket.onclose = () => {
        if (!stopped) {
          reconnectTimer = window.setTimeout(connect, reconnectDelayMs);
          reconnectDelayMs = Math.min(reconnectDelayMs * 2, 30000);
        }
      };
      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      stopped = true;
      socket?.close();
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
    };
  }, [queryClient]);
}
