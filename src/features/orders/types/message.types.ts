export type ConversationAttachment = {
  type: "image" | string;
  mediaId: string;
  mimeType?: string | null;
  sha256?: string | null;
  url: string;
};

export type ConversationMessage = {
  id: string;
  orderId?: string | null;
  chatId: string;
  direction: "INBOUND" | "OUTBOUND";
  sender: "CUSTOMER" | "BOT" | "ADMIN" | "SYSTEM";
  body: string;
  sentAt: string;
  attachment?: ConversationAttachment | null;
};
