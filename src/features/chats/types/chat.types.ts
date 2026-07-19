import type { ConversationMessage } from "../../orders/types/message.types";

export type ChatSummary = {
  chatId: string;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone: string;
  lastMessage: Pick<ConversationMessage, "id" | "body" | "direction" | "sender" | "sentAt">;
  aiEnabled: boolean;
  aiPausedUntil?: string | null;
  unreadCount?: number;
  unreadMessagesCount?: number;
  pendingCount?: number;
  pendingMessagesCount?: number;
};

export type ConversationControl = {
  aiEnabled: boolean;
  aiPausedUntil?: string | null;
  pausedUntil?: string | null;
  aiActive: boolean;
};
