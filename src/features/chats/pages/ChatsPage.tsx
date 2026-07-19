import {
  Bot,
  BotOff,
  ExternalLink,
  Image as ImageIcon,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Search,
  Send,
  TimerReset,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { env } from "../../../config/env";
import { Button } from "../../../shared/components/Button";
import { AnimatedChickenImage } from "../../../shared/components/BrandLogo";
import { EmptyState } from "../../../shared/components/EmptyState";
import { formatDateTime } from "../../../shared/utils/date";
import {
  useChatMessages,
  useChats,
  useConversationControl,
  useSendChatMessage,
  useUpdateConversationControl,
} from "../hooks/useChats";
import type { ChatSummary } from "../types/chat.types";

const CHAT_SEEN_STORAGE_KEY = "chats:last-seen";

export function ChatsPage() {
  const chats = useChats();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newChatId, setNewChatId] = useState("");
  const [body, setBody] = useState("");
  const [isConversationOpen, setIsConversationOpen] = useState(true);
  const [seenAtByChat, setSeenAtByChat] = useState<Record<string, string>>(() => readSeenChats());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messages = useChatMessages(selectedChatId);
  const control = useConversationControl(selectedChatId);
  const sendMessage = useSendChatMessage(selectedChatId);
  const updateControl = useUpdateConversationControl(selectedChatId);

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (chats.data ?? []).filter((chat) => {
      if (!query) return true;
      return [
        displayCustomerName(chat.customerName, chat.customerPhone),
        displayColombianPhone(chat.customerPhone),
        displayColombianPhone(chat.chatId),
        chat.customerPhone,
        chat.chatId,
        chat.lastMessage.body,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [chats.data, search]);

  const selectedChat = (chats.data ?? []).find((chat) => chat.chatId === selectedChatId);
  const selectedControl = control.data;
  const isAiEnabled = selectedControl?.aiEnabled ?? true;
  const isAiTemporarilyPaused = Boolean(isAiEnabled && selectedControl && !selectedControl.aiActive);
  const messageSignature = useMemo(
    () => (messages.data ?? []).map((message) => `${message.id}:${message.sentAt}`).join("|"),
    [messages.data],
  );

  useEffect(() => {
    if (!selectedChatId || !isConversationOpen) return;
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [selectedChatId, isConversationOpen, messageSignature]);

  useEffect(() => {
    if (!selectedChatId || !messages.data?.length) return;
    const latestMessage = messages.data.reduce((latest, message) =>
      new Date(message.sentAt).getTime() > new Date(latest.sentAt).getTime() ? message : latest,
    );
    setSeenAtByChat((current) => {
      if (current[selectedChatId] === latestMessage.sentAt) return current;
      const next = { ...current, [selectedChatId]: latestMessage.sentAt };
      localStorage.setItem(CHAT_SEEN_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [messageSignature, messages.data, selectedChatId]);

  useEffect(() => {
    if (!selectedChatId && filteredChats[0]) {
      setSelectedChatId(filteredChats[0].chatId);
    }
  }, [filteredChats, selectedChatId]);

  const startChat = (event: FormEvent) => {
    event.preventDefault();
    const digits = normalizeColombianPhoneId(newChatId);
    if (!digits) return;
    setSelectedChatId(digits);
    setIsConversationOpen(true);
    setNewChatId("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = body.trim();
    if (!value || !selectedChatId) return;
    await sendMessage.mutateAsync(value);
    setBody("");
  };

  return (
    <section
      className={[
        "grid h-[calc(100dvh-10rem)] max-h-[calc(100dvh-10rem)] min-h-[34rem] overflow-hidden rounded-lg border border-orange-200 bg-white/85 shadow-[0_18px_46px_rgba(106,52,18,0.10)] transition-[grid-template-columns] duration-300",
        isConversationOpen ? "lg:grid-cols-[23rem_minmax(0,1fr)]" : "lg:grid-cols-[minmax(23rem,1fr)_4.5rem]",
      ].join(" ")}
    >
      <aside className="flex min-h-0 flex-col border-b border-orange-200 bg-[#fffdf7] lg:border-b-0 lg:border-r">
        <div className="space-y-4 p-4">
          <label className="flex min-h-11 items-center gap-2 rounded-md border border-orange-200 bg-white px-3 text-sm font-semibold text-paper shadow-sm">
            <Search aria-hidden="true" className="shrink-0 text-bone" size={18} />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-smoke"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar chats..."
              value={search}
            />
          </label>
          <form className="flex gap-2" onSubmit={startChat}>
            <input
              className="min-h-11 min-w-0 flex-1 rounded-md border border-orange-200 px-3 text-sm font-semibold outline-none focus:border-flame focus:ring-2 focus:ring-flame/30"
              onChange={(event) => setNewChatId(event.target.value)}
              placeholder="Nuevo numero"
              value={newChatId}
            />
            <Button aria-label="Abrir chat" className="px-3" icon={<Plus size={18} />} type="submit" />
          </form>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filteredChats.map((chat) => {
            const isSelected = chat.chatId === selectedChatId;
            const displayName = displayCustomerName(chat.customerName, chat.customerPhone);
            const displayPhone = displayColombianPhone(chat.customerPhone);
            const isChatPaused = !chat.aiEnabled || isFutureDate(chat.aiPausedUntil);
            const pendingCount = pendingMessagesCount(chat, seenAtByChat[chat.chatId]);
            return (
              <button
                className={[
                  "mx-3 mb-2 flex w-[calc(100%-1.5rem)] gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                  isSelected ? "bg-[#fff1d8] shadow-sm" : "bg-transparent hover:bg-orange-50",
                ].join(" ")}
                key={chat.chatId}
                onClick={() => {
                  setSelectedChatId(chat.chatId);
                  setIsConversationOpen(true);
                }}
                type="button"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-extrabold text-emerald-900">
                  {initials(displayName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <strong className="truncate text-base text-paper">{displayName}</strong>
                    <span className="shrink-0 text-xs font-semibold text-smoke">
                      {formatDateTime(chat.lastMessage.sentAt)}
                    </span>
                  </span>
                  {chat.customerName && displayName !== displayPhone ? (
                    <span className="mt-0.5 block truncate text-xs font-semibold text-smoke">{displayPhone}</span>
                  ) : null}
                  <span className="mt-1 flex min-w-0 items-center gap-2">
                    {isChatPaused ? (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700 ring-1 ring-emerald-200">
                        Atendiendo
                      </span>
                    ) : null}
                    <span className="block min-w-0 truncate text-sm font-semibold text-bone">{chat.lastMessage.body}</span>
                    {pendingCount > 0 ? (
                      <span
                        aria-label={`${pendingCount} mensajes pendientes`}
                        className="ml-auto grid min-h-6 min-w-6 shrink-0 place-items-center rounded-full bg-ember px-1.5 text-xs font-black leading-none text-white shadow-sm"
                      >
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            );
          })}
          {!filteredChats.length ? (
            <div className="p-4">
              <EmptyState title="No hay chats" message="Cuando llegue un mensaje aparecera aqui." />
            </div>
          ) : null}
        </div>
      </aside>

      <div
        className={[
          "chat-canvas flex min-h-0 min-w-0 flex-col transition-transform duration-300",
          isConversationOpen ? "" : "lg:translate-x-0",
        ].join(" ")}
      >
        <header className="flex min-h-24 items-center justify-between gap-3 border-b border-orange-200 bg-[#fffdf7] px-5">
          <button
            aria-label={isConversationOpen ? "Contraer panel de conversacion" : "Desplegar panel de conversacion"}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-orange-200 bg-white text-bone transition-colors hover:bg-orange-50 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame"
            type="button"
            onClick={() => setIsConversationOpen((value) => !value)}
          >
            {isConversationOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </button>
          <div className={["min-w-0 flex-1", isConversationOpen ? "" : "hidden lg:block [writing-mode:vertical-rl]"].join(" ")}>
            <h2 className="truncate text-2xl font-black text-paper">
              {isConversationOpen
                ? selectedChat
                  ? displayCustomerName(selectedChat.customerName, selectedChat.customerPhone)
                  : selectedChatId
                    ? displayColombianPhone(selectedChatId)
                    : "Selecciona un chat"
                : "Chat"}
            </h2>
            {isConversationOpen ? (
              <p className="text-sm font-semibold text-bone">
                {selectedChat ? displayColombianPhone(selectedChat.customerPhone) : selectedChatId ? displayColombianPhone(selectedChatId) : ""}
              </p>
            ) : null}
          </div>
          {selectedChatId && isConversationOpen ? (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {isAiTemporarilyPaused ? (
                <>
                  <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-emerald-50 px-3 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">
                    <UserRound size={15} />
                    Atendiendo tú
                    {selectedControl?.pausedUntil ? (
                      <span className="hidden text-emerald-900/70 sm:inline">
                        hasta {formatShortTime(selectedControl.pausedUntil)}
                      </span>
                    ) : null}
                  </span>
                  <Button
                    className="min-h-9 px-3 py-1.5 text-xs"
                    disabled={updateControl.isPending}
                    icon={<Bot size={15} />}
                    onClick={() => updateControl.mutate({ aiEnabled: true, pauseMinutes: 0 })}
                    variant="secondary"
                  >
                    Reactivar IA
                  </Button>
                </>
              ) : !isAiEnabled ? (
                <>
                  <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-red-50 px-3 text-xs font-black text-ember ring-1 ring-red-100">
                    <BotOff size={15} />
                    IA apagada
                  </span>
                  <Button
                    className="min-h-9 px-3 py-1.5 text-xs"
                    disabled={updateControl.isPending}
                    icon={<Bot size={15} />}
                    onClick={() => updateControl.mutate({ aiEnabled: true, pauseMinutes: 0 })}
                    variant="secondary"
                  >
                    Encender
                  </Button>
                </>
              ) : (
                <>
                  <span className="hidden min-h-9 items-center gap-2 rounded-full bg-emerald-50 px-3 text-xs font-black text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex">
                    <Bot size={15} />
                    IA activa
                  </span>
                  <Button
                    className="min-h-9 px-3 py-1.5 text-xs"
                    disabled={updateControl.isPending}
                    icon={<UserRound size={15} />}
                    onClick={() => updateControl.mutate({ aiEnabled: true, pauseMinutes: 30 })}
                  >
                    Atender 30 min
                  </Button>
                  <Button
                    aria-label="Apagar IA para este chat"
                    className="min-h-9 px-3 py-1.5 text-xs"
                    disabled={updateControl.isPending}
                    icon={<BotOff size={15} />}
                    onClick={() => updateControl.mutate({ aiEnabled: false })}
                    variant="ghost"
                  >
                    Apagar
                  </Button>
                </>
              )}
            </div>
          ) : null}
        </header>

        {isConversationOpen ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              {!selectedChatId ? (
                <EmptyState title="Abre una conversacion" message="Selecciona un cliente o inicia un chat por numero." />
              ) : null}
              <div className="flex min-h-full flex-col justify-end gap-3">
                {messages.data?.map((message) => {
                  const isOutgoing = message.direction === "OUTBOUND";
                  return (
                    <div className={["flex items-end gap-3", isOutgoing ? "justify-end" : "justify-start"].join(" ")} key={message.id}>
                      <div
                        className={[
                          "max-w-[78%] rounded-lg px-5 py-3 text-base shadow-[0_8px_18px_rgba(74,31,12,0.08)]",
                          isOutgoing ? "bg-[#def4d0] text-paper" : "bg-[#fff8ec] text-paper",
                        ].join(" ")}
                      >
                        {message.attachment?.type === "image" ? (
                          <ChatAttachmentPreview
                            alt={message.body || "Comprobante enviado por WhatsApp"}
                            url={mediaUrl(message.attachment.url)}
                          />
                        ) : null}
                        {message.body ? (
                          <p className="whitespace-pre-wrap break-words font-semibold">{message.body}</p>
                        ) : null}
                        <p className="mt-2 text-right text-[11px] font-semibold text-smoke">
                          {formatDateTime(message.sentAt)}
                        </p>
                      </div>
                      {isOutgoing ? (
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                          <AnimatedChickenImage className="h-9 w-9" />
                        </span>
                      ) : null}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form className="shrink-0 border-t border-orange-200 bg-white/92 p-4" onSubmit={submit}>
              {selectedChatId ? (
                <div
                  className={[
                    "mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs font-bold",
                    isAiTemporarilyPaused
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : !isAiEnabled
                        ? "border-red-100 bg-red-50 text-ember"
                        : "border-orange-200 bg-[#fff8e9] text-bone",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    {isAiTemporarilyPaused ? <UserRound size={16} /> : !isAiEnabled ? <BotOff size={16} /> : <Bot size={16} />}
                    {isAiTemporarilyPaused
                      ? `Estás atendiendo este chat${selectedControl?.pausedUntil ? ` hasta ${formatShortTime(selectedControl.pausedUntil)}` : ""}.`
                      : !isAiEnabled
                        ? "La IA está apagada para este chat."
                        : "La IA está activa. Si vas a responder tú, pausa primero."}
                  </span>
                  {isAiTemporarilyPaused || !isAiEnabled ? (
                    <button
                      className="inline-flex min-h-8 items-center gap-1 rounded-md bg-white px-2 font-black text-paper ring-1 ring-orange-200 transition hover:bg-orange-50"
                      disabled={updateControl.isPending}
                      onClick={() => updateControl.mutate({ aiEnabled: true, pauseMinutes: 0 })}
                      type="button"
                    >
                      <TimerReset size={14} />
                      Reactivar IA
                    </button>
                  ) : (
                    <button
                      className="inline-flex min-h-8 items-center gap-1 rounded-md bg-flame px-2 font-black text-ink transition hover:bg-yellow-300"
                      disabled={updateControl.isPending}
                      onClick={() => updateControl.mutate({ aiEnabled: true, pauseMinutes: 30 })}
                      type="button"
                    >
                      <UserRound size={14} />
                      Atender yo 30 min
                    </button>
                  )}
                </div>
              ) : null}
              <div className="flex gap-3">
                <input
                  className="min-h-12 min-w-0 flex-1 rounded-lg border border-orange-200 px-4 text-sm font-semibold outline-none placeholder:text-smoke focus:border-flame focus:ring-2 focus:ring-flame/30"
                  disabled={!selectedChatId}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Escribe un mensaje..."
                  value={body}
                />
                <Button
                  className="min-w-28 bg-ember text-white hover:bg-red-600"
                  disabled={!selectedChatId}
                  icon={<Send size={18} />}
                  isLoading={sendMessage.isPending}
                  type="submit"
                >
                  Enviar
                </Button>
              </div>
            </form>
          </>
        ) : null}
      </div>
    </section>
  );
}

function ChatAttachmentPreview({ alt, url }: { alt: string; url: string }) {
  return (
    <a
      className="group mb-2 block overflow-hidden rounded-md border border-orange-100 bg-[#fff8ed] outline-none ring-flame/30 transition focus-visible:ring-2"
      href={url}
      onClick={(event) => {
        event.preventDefault();
        void openProtectedMedia(url);
      }}
      rel="noreferrer"
      target="_blank"
      title="Abrir comprobante"
    >
      <ProtectedMediaImage
        alt={alt}
        className="max-h-72 w-full min-w-44 max-w-xs object-contain"
        url={url}
      />
      <span className="flex items-center justify-between gap-2 border-t border-orange-100 px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide text-bone">
        <span className="flex items-center gap-1">
          <ImageIcon size={13} />
          Comprobante
        </span>
        <ExternalLink className="opacity-70 transition group-hover:opacity-100" size={13} />
      </span>
    </a>
  );
}

function ProtectedMediaImage({ alt, className, url }: { alt: string; className: string; url: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    setSrc(null);
    setFailed(false);

    fetch(url, { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("media_not_available");
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (src) {
    return <img alt={alt} className={className} loading="eager" src={src} />;
  }

  return (
    <div className="flex min-h-32 min-w-44 max-w-xs items-center justify-center bg-orange-50 px-3 py-6 text-center text-xs font-bold text-bone">
      {failed ? "No se pudo mostrar la imagen aqui. Toca para abrirla." : "Cargando comprobante..."}
    </div>
  );
}

async function openProtectedMedia(url: string) {
  const tab = window.open("", "_blank");
  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error("media_not_available");
    const objectUrl = URL.createObjectURL(await response.blob());
    if (tab) {
      tab.location.href = objectUrl;
    } else {
      window.open(objectUrl, "_blank");
    }
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch {
    tab?.close();
    window.location.href = url;
  }
}

function isFutureDate(value: string | null | undefined) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
}

function formatShortTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function displayCustomerName(name: string | null | undefined, phone: string) {
  if (!name) return displayColombianPhone(phone);
  const nameDigits = name.replace(/\D/g, "");
  const phoneDigits = phone.replace(/\D/g, "");
  if (nameDigits && nameDigits === phoneDigits) return displayColombianPhone(phone);
  return name;
}

function displayColombianPhone(value: string | null | undefined) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("57") && digits.length > 10) {
    return digits.slice(2);
  }
  return digits || value;
}

function normalizeColombianPhoneId(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `57${digits}`;
  return digits;
}

function mediaUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const adminMediaPath = path.replace("/api/admin/conversations/media/", "/api/media/whatsapp/");
  const apiOrigin = env.apiBaseUrl.replace(/(?:\/api)+\/?$/, "");
  return `${apiOrigin}${adminMediaPath}`;
}

function pendingMessagesCount(chat: ChatSummary, seenAt?: string) {
  const explicitCount =
    chat.unreadCount ??
    chat.unreadMessagesCount ??
    chat.pendingCount ??
    chat.pendingMessagesCount;

  if (typeof explicitCount === "number" && Number.isFinite(explicitCount)) {
    return Math.max(0, explicitCount);
  }

  if (chat.lastMessage.direction !== "INBOUND") return 0;
  if (!seenAt) return 1;
  return new Date(chat.lastMessage.sentAt).getTime() > new Date(seenAt).getTime() ? 1 : 0;
}

function readSeenChats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHAT_SEEN_STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
  } catch {
    return {};
  }
}
