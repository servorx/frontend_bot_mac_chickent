import {
  Bot,
  ExternalLink,
  Image as ImageIcon,
  MessageCircle,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { env } from "../../../config/env";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { formatDateTime } from "../../../shared/utils/date";
import {
  useChatMessages,
  useChats,
  useConversationControl,
  useSendChatMessage,
  useUpdateConversationControl,
} from "../hooks/useChats";

export function ChatsPage() {
  const chats = useChats();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newChatId, setNewChatId] = useState("");
  const [body, setBody] = useState("");
  const [isConversationOpen, setIsConversationOpen] = useState(true);
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
  const messageSignature = useMemo(
    () => (messages.data ?? []).map((message) => `${message.id}:${message.sentAt}`).join("|"),
    [messages.data],
  );

  useEffect(() => {
    if (!selectedChatId || !isConversationOpen) return;
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [selectedChatId, isConversationOpen, messageSignature]);

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
        "grid h-[calc(100dvh-8rem)] max-h-[calc(100dvh-8rem)] min-h-[34rem] overflow-hidden rounded-lg border border-orange-200 bg-white/85 shadow-[0_18px_46px_rgba(106,52,18,0.12)] transition-[grid-template-columns] duration-300",
        isConversationOpen ? "lg:grid-cols-[21rem_minmax(0,1fr)]" : "lg:grid-cols-[minmax(21rem,1fr)_4.5rem]",
      ].join(" ")}
    >
      <aside className="flex min-h-0 flex-col border-b border-orange-200 bg-[#fffdf7] lg:border-b-0 lg:border-r">
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="ops-title text-4xl">Chats</h1>
            <MessageCircle className="text-ember" size={24} />
          </div>
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
            return (
              <button
                className={[
                  "flex w-full gap-3 border-t border-orange-100 px-4 py-4 text-left transition-colors",
                  isSelected ? "bg-[#fff1d8]" : "bg-white hover:bg-orange-50",
                ].join(" ")}
                key={chat.chatId}
                onClick={() => {
                  setSelectedChatId(chat.chatId);
                  setIsConversationOpen(true);
                }}
                type="button"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-flame/20 font-extrabold text-ember">
                  {initials(displayName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <strong className="truncate text-sm text-paper">{displayName}</strong>
                    <span className="shrink-0 text-xs font-semibold text-smoke">
                      {formatDateTime(chat.lastMessage.sentAt)}
                    </span>
                  </span>
                  {chat.customerName && displayName !== displayPhone ? (
                    <span className="mt-0.5 block truncate text-xs font-semibold text-smoke">{displayPhone}</span>
                  ) : null}
                  <span className="mt-1 block truncate text-sm font-semibold text-bone">{chat.lastMessage.body}</span>
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
        <header className="flex min-h-20 items-center justify-between gap-3 border-b border-orange-200 bg-[#fff8e9] px-5">
          <button
            aria-label={isConversationOpen ? "Contraer panel de conversacion" : "Desplegar panel de conversacion"}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-orange-200 bg-white text-bone transition-colors hover:bg-orange-50 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame"
            type="button"
            onClick={() => setIsConversationOpen((value) => !value)}
          >
            {isConversationOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </button>
          <div className={["min-w-0 flex-1", isConversationOpen ? "" : "hidden lg:block [writing-mode:vertical-rl]"].join(" ")}>
            <h2 className="truncate text-lg font-extrabold text-paper">
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
            <label className="flex items-center gap-2 text-sm font-bold text-bone">
              <Bot size={18} />
              IA
              <input
                checked={control.data?.aiEnabled ?? true}
                className="h-5 w-5 accent-ember"
                disabled={updateControl.isPending}
                onChange={(event) => updateControl.mutate(event.target.checked)}
                type="checkbox"
              />
            </label>
          ) : null}
        </header>

        {isConversationOpen ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {!selectedChatId ? (
                <EmptyState title="Abre una conversacion" message="Selecciona un cliente o inicia un chat por numero." />
              ) : null}
              <div className="flex min-h-full flex-col justify-end gap-3">
                {messages.data?.map((message) => {
                  const isOutgoing = message.direction === "OUTBOUND";
                  return (
                    <div className={["flex", isOutgoing ? "justify-end" : "justify-start"].join(" ")} key={message.id}>
                      <div
                        className={[
                          "max-w-[78%] rounded-lg px-3 py-2 text-sm shadow-[0_8px_18px_rgba(74,31,12,0.08)]",
                          isOutgoing ? "bg-[#d9ffd4] text-paper" : "bg-white text-paper",
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
                        <p className="mt-1 text-right text-[11px] font-semibold text-smoke">
                          {formatDateTime(message.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form className="shrink-0 border-t border-orange-200 bg-white p-4" onSubmit={submit}>
              {selectedChatId && control.data?.aiEnabled && !control.data.aiActive ? (
                <p className="mb-2 text-xs font-bold text-bone">
                  IA pausada temporalmente por respuesta manual del administrador.
                </p>
              ) : null}
              <div className="flex gap-2">
                <input
                  className="min-h-11 min-w-0 flex-1 rounded-md border border-orange-200 px-3 text-sm font-semibold outline-none placeholder:text-smoke focus:border-flame focus:ring-2 focus:ring-flame/30"
                  disabled={!selectedChatId}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Escribe un mensaje..."
                  value={body}
                />
                <Button
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
  const adminMediaPath = path.replace("/api/media/whatsapp/", "/api/admin/conversations/media/");
  const apiOrigin = env.apiBaseUrl.replace(/(?:\/api)+\/?$/, "");
  return `${apiOrigin}${adminMediaPath}`;
}
