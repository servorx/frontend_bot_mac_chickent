import { ExternalLink, Image as ImageIcon, MessageSquareText, Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { env } from "../../../config/env";
import { Button } from "../../../shared/components/Button";
import { AnimatedChickenImage } from "../../../shared/components/BrandLogo";
import { Card } from "../../../shared/components/Card";
import { formatDateTime } from "../../../shared/utils/date";
import { useOrderMessages, useSendOrderMessage } from "../hooks/useOrderMessages";
import type { AdminOrder } from "../types/order.types";

type PreparingTemplate = {
  id: string;
  label: string;
  body: string;
  match: string[];
  group: "chicken" | "soup" | "lasagna" | "maduro";
};

const PREPARING_MESSAGE_TEMPLATES: PreparingTemplate[] = [
  {
    id: "asado-quarter-breast",
    label: "1/4 asado sin pechuga",
    body: "estimado cliente en este momento no contamos con 1/4 de pechuga asada sin embargo contamos con una deliciosa pierna asada, desea pedir de igual manera?",
    match: ["1/4 asado", "asado cuarto"],
    group: "chicken",
  },
  {
    id: "asado-quarter-leg",
    label: "1/4 asado sin pierna",
    body: "estimado cliente en este momento no contamos con 1/4 de pierna asada sin embargo contamos con una deliciosa pechuga, desea pedir de igual manera?",
    match: ["1/4 asado", "asado cuarto"],
    group: "chicken",
  },
  {
    id: "broaster-quarter-breast",
    label: "1/4 broaster sin pechuga",
    body: "estimado cliente en este momento no contamos con 1/4 de pechuga broaster sin embargo contamos con una deliciosa pierna, desea pedir de igual manera?",
    match: ["1/4 broasted", "1/4 broaster", "broaster cuarto", "broasted cuarto"],
    group: "chicken",
  },
  {
    id: "broaster-quarter-leg",
    label: "1/4 broaster sin pierna",
    body: "estimado cliente en este momento no contamos con 1/4 de pierna broaster sin embargo contamos con una deliciosa pechuga, desea pedir de igual manera?",
    match: ["1/4 broasted", "1/4 broaster", "broaster cuarto", "broasted cuarto"],
    group: "chicken",
  },
  {
    id: "broaster-three-quarter-legs",
    label: "3/4 broaster sin 2 piernas",
    body: "estimado cliente en este momento no contamos con 3/4 dos piernas una pechuga de broaster sin embargo contamos con un delicioso 3/4 dos pechugas una pierna, desea pedir de igual manera?",
    match: ["3/4 broasted", "3/4 broaster", "broaster 3/4", "broasted 3/4"],
    group: "chicken",
  },
  {
    id: "broaster-three-quarter-breasts",
    label: "3/4 broaster sin 2 pechugas",
    body: "estimado cliente en este momento no contamos con 3/4 dos pechugas una pierna de broaster sin embargo contamos con un delicioso 3/4 dos piernas una pechuga, desea pedir de igual manera?",
    match: ["3/4 broasted", "3/4 broaster", "broaster 3/4", "broasted 3/4"],
    group: "chicken",
  },
  {
    id: "asado-three-quarter-legs",
    label: "3/4 asado sin 2 piernas",
    body: "estimado cliente en este momento no contamos con 3/4 dos piernas una pechuga de asado sin embargo contamos con un delicioso 3/4 dos pechugas una pierna, desea pedir de igual manera?",
    match: ["3/4 asado", "asado 3/4"],
    group: "chicken",
  },
  {
    id: "asado-three-quarter-breasts",
    label: "3/4 asado sin 2 pechugas",
    body: "estimado cliente en este momento no contamos con 3/4 dos pechugas una pierna de asado sin embargo contamos con un delicioso 3/4 dos piernas una pechuga, desea pedir de igual manera?",
    match: ["3/4 asado", "asado 3/4"],
    group: "chicken",
  },
  {
    id: "soup",
    label: "Sopas agotadas",
    body: "estimado cliente en este momento no contamos con sopas debido a que estan agotadas en cocina, desea pedir de igual manera?",
    match: ["sopa"],
    group: "soup",
  },
  {
    id: "lasagna",
    label: "Lasañas agotadas",
    body: "estimado cliente en este momento no contamos con lasañas debido a que estan agotadas en cocina, desea pedir de alguna otra cosa?",
    match: ["lasagna", "lasaña", "lasana"],
    group: "lasagna",
  },
  {
    id: "maduro",
    label: "Maduros agotados",
    body: "estimado cliente en este momento no contamos con maduros debido a que estan agotados en cocina, desea pedir de igual manera?",
    match: ["maduro"],
    group: "maduro",
  },
];

export function OrderConversationPanel({ order }: { order: AdminOrder }) {
  const messages = useOrderMessages(order.id);
  const sendMessage = useSendOrderMessage(order.id);
  const [body, setBody] = useState("");
  const templates = templatesForOrder(order);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = body.trim();
    if (!value) {
      return;
    }
    await sendMessage.mutateAsync({ body: value });
    setBody("");
  };

  const sendTemplate = async (template: PreparingTemplate) => {
    if (!template.body.trim()) {
      return;
    }
    await sendMessage.mutateAsync({ body: template.body, withButtons: true });
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-ember">Conversacion con cliente</h2>
          <p className="mt-1 text-sm font-semibold text-bone">Escribe aqui para resolver demoras, cambios o dudas del pedido.</p>
        </div>
      </div>

      <div className="chat-canvas mt-4 max-h-96 space-y-4 overflow-y-auto rounded-lg border border-orange-100 p-4">
        {messages.isLoading ? <p className="text-sm font-semibold text-bone">Cargando mensajes...</p> : null}
        {messages.data?.length === 0 ? (
          <p className="text-sm font-semibold text-bone">Aun no hay mensajes guardados para este pedido.</p>
        ) : null}
        {messages.data?.map((message) => {
          const isOutgoing = message.direction === "OUTBOUND";
          return (
            <div className={["flex items-end gap-3", isOutgoing ? "justify-end" : "justify-start"].join(" ")} key={message.id}>
              <div
                className={[
                  "max-w-[88%] rounded-lg px-4 py-3 text-sm text-paper shadow-[0_8px_18px_rgba(74,31,12,0.08)]",
                  isOutgoing ? "bg-[#def4d0]" : "bg-[#fff8ec]",
                ].join(" ")}
              >
                {message.attachment?.type === "image" ? (
                  <OrderAttachmentPreview
                    alt={message.body || "Comprobante enviado por WhatsApp"}
                    url={mediaUrl(message.attachment.url)}
                  />
                ) : null}
                {message.body ? <p className="break-words whitespace-pre-wrap font-semibold">{message.body}</p> : null}
                <p className="mt-2 text-right text-[11px] font-semibold text-smoke">{formatDateTime(message.sentAt)}</p>
              </div>
              {isOutgoing ? (
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <AnimatedChickenImage className="h-8 w-8" />
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {order.status === "PREPARING" ? (
        <div className="mt-4 rounded-lg border border-orange-200 bg-white/90 p-3 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-extrabold text-paper">
              <MessageSquareText size={18} />
              Mensajes rapidos con botones Si / No
            </div>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold text-bone">
              {templates.length} sugeridos para este pedido
            </span>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <button
                className="min-h-24 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-left text-sm font-extrabold text-paper transition-colors hover:border-flame hover:bg-yellow-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame disabled:cursor-not-allowed disabled:opacity-60"
                disabled={sendMessage.isPending}
                key={template.id}
                type="button"
                onClick={() => void sendTemplate(template)}
              >
                <span className="mb-1 flex items-center gap-2 text-ember">
                  <MessageSquareText size={16} />
                  {template.label}
                </span>
                <span className="line-clamp-3 text-xs font-semibold text-bone">{template.body}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold text-bone">
            La respuesta del cliente queda registrada aqui y en Chats.
          </p>
        </div>
      ) : null}

      <form className="mt-4 flex flex-col gap-3 rounded-lg border border-orange-200 bg-white p-3 sm:flex-row sm:items-end" onSubmit={submit}>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Mensaje para el cliente</span>
          <textarea
            className="min-h-11 w-full resize-y rounded-md border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-paper outline-none transition-colors placeholder:text-smoke focus:border-flame focus:ring-2 focus:ring-flame/30"
            placeholder="Escribe un mensaje..."
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </label>
        <Button className="sm:self-end" icon={<Send size={18} />} isLoading={sendMessage.isPending} type="submit">
          Enviar
        </Button>
      </form>
    </Card>
  );
}

function templatesForOrder(order: AdminOrder) {
  const haystack = order.items
    .map((item) => normalizeTemplateText(`${item.productCode ?? ""} ${item.productName}`))
    .join(" | ");
  const hasChicken = /\b(asado|broaster|broasted|pollo)\b/.test(haystack);
  const hasLasagna = /\b(lasagna|lasana|lasaña)\b/.test(haystack);
  const hasMaduro = /\bmaduro\b/.test(haystack);
  const templates: PreparingTemplate[] = [];

  if (hasChicken) {
    templates.push(...PREPARING_MESSAGE_TEMPLATES.filter((template) => template.group === "soup"));
    templates.push(
      ...PREPARING_MESSAGE_TEMPLATES.filter(
        (template) =>
          template.group === "chicken" &&
          template.match.some((term) => haystack.includes(normalizeTemplateText(term))),
      ),
    );
  }

  if (hasLasagna) {
    templates.push(...PREPARING_MESSAGE_TEMPLATES.filter((template) => template.group === "lasagna"));
  }

  if (hasMaduro) {
    templates.push(...PREPARING_MESSAGE_TEMPLATES.filter((template) => template.group === "maduro"));
  }

  return uniqueTemplates(templates);
}

function normalizeTemplateText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function OrderAttachmentPreview({ alt, url }: { alt: string; url: string }) {
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
        className="max-h-64 w-full min-w-44 max-w-xs object-contain"
        url={url}
      />
      <span className="flex items-center justify-between gap-2 border-t border-orange-100 px-2 py-1 text-[11px] font-extrabold uppercase text-bone">
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

function uniqueTemplates(templates: PreparingTemplate[]) {
  const seen = new Set<string>();
  return templates.filter((template) => {
    if (seen.has(template.id)) {
      return false;
    }
    seen.add(template.id);
    return true;
  });
}

function mediaUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const adminMediaPath = path.replace("/api/admin/conversations/media/", "/api/media/whatsapp/");
  const apiOrigin = env.apiBaseUrl.replace(/(?:\/api)+\/?$/, "");
  return `${apiOrigin}${adminMediaPath}`;
}
