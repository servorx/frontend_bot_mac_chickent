import { apiClient } from "../../../shared/api/apiClient";
import type { ConversationMessage } from "../../orders/types/message.types";
import type { ChatSummary, ConversationControl } from "../types/chat.types";

export async function getChats(): Promise<ChatSummary[]> {
  const { data } = await apiClient.get<{ data: ChatSummary[] }>("/admin/conversations");
  return data.data;
}

export async function getChatMessages(chatId: string): Promise<ConversationMessage[]> {
  const { data } = await apiClient.get<{ data: ConversationMessage[] }>(
    `/admin/conversations/${chatId}/messages`,
  );
  return data.data;
}

export async function sendChatMessage(chatId: string, body: string): Promise<ConversationMessage> {
  const { data } = await apiClient.post<{ data: ConversationMessage }>(
    `/admin/conversations/${chatId}/messages`,
    { body },
  );
  return data.data;
}

export async function getConversationControl(chatId: string): Promise<ConversationControl> {
  const { data } = await apiClient.get<{ data: ConversationControl }>(
    `/admin/conversations/${chatId}/control`,
  );
  return data.data;
}

export async function updateConversationControl(
  chatId: string,
  aiEnabled: boolean,
): Promise<ConversationControl> {
  const { data } = await apiClient.put<{ data: ConversationControl }>(
    `/admin/conversations/${chatId}/control`,
    { aiEnabled },
  );
  return data.data;
}
