import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getChatMessages,
  getChats,
  getConversationControl,
  sendChatMessage,
  updateConversationControl,
} from "../services/chat.service";

export const chatKeys = {
  list: ["chats"] as const,
  messages: (chatId: string) => ["chat-messages", chatId] as const,
  control: (chatId: string) => ["chat-control", chatId] as const,
};

export function useChats() {
  return useQuery({
    queryKey: chatKeys.list,
    queryFn: getChats,
  });
}

export function useChatMessages(chatId: string | null) {
  return useQuery({
    queryKey: chatKeys.messages(chatId ?? ""),
    queryFn: () => getChatMessages(chatId ?? ""),
    enabled: Boolean(chatId),
  });
}

export function useConversationControl(chatId: string | null) {
  return useQuery({
    queryKey: chatKeys.control(chatId ?? ""),
    queryFn: () => getConversationControl(chatId ?? ""),
    enabled: Boolean(chatId),
  });
}

export function useSendChatMessage(chatId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => sendChatMessage(chatId ?? "", body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chatKeys.list }),
        queryClient.invalidateQueries({ queryKey: chatKeys.messages(chatId ?? "") }),
        queryClient.invalidateQueries({ queryKey: chatKeys.control(chatId ?? "") }),
      ]);
    },
  });
}

export function useUpdateConversationControl(chatId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aiEnabled: boolean) => updateConversationControl(chatId ?? "", aiEnabled),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chatKeys.list }),
        queryClient.invalidateQueries({ queryKey: chatKeys.control(chatId ?? "") }),
      ]);
    },
  });
}
