import { apiClient } from "../../../shared/api/apiClient";
import type { ConversationMessage } from "../types/message.types";

export async function getOrderMessages(orderId: string): Promise<ConversationMessage[]> {
  const { data } = await apiClient.get<{ data: ConversationMessage[] }>(
    `/admin/conversations/orders/${orderId}/messages`,
  );
  return data.data;
}

export type SendOrderMessagePayload = {
  body: string;
  withButtons?: boolean;
};

export async function sendOrderMessage(
  orderId: string,
  payload: SendOrderMessagePayload,
): Promise<ConversationMessage> {
  const { data } = await apiClient.post<{ data: ConversationMessage }>(
    `/admin/conversations/orders/${orderId}/messages`,
    payload,
  );
  return data.data;
}
