import type { AdminOrder } from "../types/order.types";

const BUSINESS_HEADER = [
  "ANA LUCIA PATIÑO RUEDA",
  "28.378.931-7",
  "MAX CHICKEN EXPRESS",
  "TELEFONO: 6488932 - 6497732",
  "CARRERA 3 # 48-06 LAGOS 2",
];

const CANVAS_WIDTH_PX = 576;
const CANVAS_PADDING_X = 22;
const CANVAS_PADDING_Y = 20;
const RECEIPT_WIDTH_CHARS = 32;
const NORMAL_FONT = '700 24px "Courier New", Courier, monospace';
const STRONG_FONT = '900 28px "Courier New", Courier, monospace';
const SMALL_FONT = '700 22px "Courier New", Courier, monospace';
const LINE_HEIGHT = 32;
const STRONG_LINE_HEIGHT = 38;
const SAFE_TWO_COPY_LINE_LIMIT = 38;

type ReceiptLine = {
  text: string;
  align?: "left" | "center" | "right";
  variant?: "normal" | "strong" | "small";
};

export function printOrderInvoice(order: AdminOrder): void {
  const receiptLines = buildReceiptLines(order);
  const canPrintTwoCopiesOnOnePage = receiptLines.length <= SAFE_TWO_COPY_LINE_LIMIT;
  const receiptImage = renderReceiptImage(receiptLines);

  const html = `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Factura ${escapeHtml(order.invoiceNumber ?? order.orderNumber)}</title>
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            width: 80mm;
            min-width: 80mm;
            background: #ffffff;
          }
          @page {
            size: 80mm 297mm;
            margin: 0;
          }
          .receipt-page {
            width: 80mm;
            margin: 0;
            padding: 2mm 3mm 4mm;
            background: #ffffff;
          }
          .receipt-img {
            display: block;
            width: 74mm;
            max-width: 74mm;
            height: auto;
            margin: 0;
            break-inside: avoid;
            page-break-inside: avoid;
            image-rendering: crisp-edges;
          }
          .copy-gap {
            width: 74mm;
            margin: 3mm 0;
            border-top: 1px dashed #000000;
            ${canPrintTwoCopiesOnOnePage ? "" : "break-before: page; page-break-before: always;"}
          }
          @media print {
            html, body { width: 80mm; min-width: 80mm; }
            .receipt-page { padding: 2mm 3mm 4mm; }
          }
        </style>
      </head>
      <body>
        <main class="receipt-page">
          <img class="receipt-img" alt="Factura" src="${receiptImage}" />
          <div class="copy-gap"></div>
          <img class="receipt-img" alt="Copia de factura" src="${receiptImage}" />
        </main>
      </body>
    </html>
  `;

  const iframe = document.createElement("iframe");
  iframe.title = `Factura ${order.orderNumber}`;
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "-10000px";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";

  document.body.appendChild(iframe);

  const frameDocument = iframe.contentDocument;
  const frameWindow = iframe.contentWindow;

  if (!frameDocument || !frameWindow) {
    iframe.remove();
    return;
  }

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 500);
  };

  frameWindow.addEventListener("afterprint", cleanup, { once: true });
  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  window.setTimeout(() => {
    frameWindow.focus();
    frameWindow.print();
    window.setTimeout(cleanup, 5000);
  }, 450);
}

function buildReceiptLines(order: AdminOrder): ReceiptLine[] {
  const createdAt = new Date(order.createdAt);
  const customer = order.customer;
  const isPickup = order.fulfillmentType === "PICKUP";
  const paymentMethod = clean(order.paymentMethod || "No registrado");
  const note = clean(order.observations?.trim() || "Sin nota");
  const deliveryFee = Number(order.deliveryFee || 0);
  const location = splitDeliveryLocation(customer.address, customer.neighborhood);

  const lines: ReceiptLine[] = [];

  BUSINESS_HEADER.forEach((line) => lines.push({ text: clean(line), align: "center", variant: "small" }));
  lines.push(blank(), line("Cant Detalle              Dinero", "small"), separator());

  order.items.forEach((item) => {
    lines.push(...formatItem(Number(item.quantity || 0), clean(item.productName || "Producto"), Number(item.subtotal || 0)));
  });

  if (!isPickup && deliveryFee > 0) {
    lines.push(...formatItem(1, "Domicilio", deliveryFee));
  }

  lines.push(separator());
  lines.push(line(row("*** TOTAL ***", formatReceiptMoney(order.total)), "strong"));
  lines.push(line(row(isPickup ? "Recoge en local" : paymentMethod, formatReceiptMoney(order.total))));
  lines.push(line(row("Completo", "0")));
  lines.push(blank());
  lines.push(line(`FECHA: ${formatReceiptDate(createdAt)}`));
  lines.push(line(`HORA: ${formatReceiptTime(createdAt)}`));
  lines.push(blank());

  const customerLines = isPickup ? [
    ["Nombre", customer.fullName],
    ["Telefono", customer.phone],
    ["Tipo", "Recoge en local"],
    ["Nota", note],
  ] : [
    ["Nombre", customer.fullName],
    ["Telefono", customer.phone],
    ["Direccion", location.address],
    ["Barrio", location.neighborhood],
    ["Pago", paymentMethod],
    ["Nota", note],
  ];

  customerLines.forEach(([label, value]) => {
    wrap(`${label}: ${clean(value || "No registrado")}`, RECEIPT_WIDTH_CHARS).forEach((part) => {
      lines.push(line(part));
    });
  });

  lines.push(blank());
  lines.push({ text: "<<< REGIMEN SIMPLIFICADO >>>", align: "center", variant: "small" });
  lines.push({ text: "GRACIAS POR SU COMPRA", align: "center", variant: "small" });

  return lines;
}

function splitDeliveryLocation(address: string, neighborhood: string): { address: string; neighborhood: string } {
  const cleanAddress = clean(address);
  const cleanNeighborhood = clean(neighborhood);
  const neighborhoodIncluded = /incluido en direccion/i.test(cleanNeighborhood);
  const separatorMatch = cleanAddress.match(/\s+-\s+([^-]+)$/);

  if (neighborhoodIncluded && separatorMatch) {
    return {
      address: cleanAddress.slice(0, separatorMatch.index).trim(),
      neighborhood: separatorMatch[1].trim(),
    };
  }

  return {
    address: cleanAddress,
    neighborhood: cleanNeighborhood,
  };
}

function renderReceiptImage(lines: ReceiptLine[]): string {
  const canvas = document.createElement("canvas");
  const height = calculateCanvasHeight(lines);
  canvas.width = CANVAS_WIDTH_PX;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000000";
  context.textBaseline = "top";
  context.imageSmoothingEnabled = false;

  let y = CANVAS_PADDING_Y;
  lines.forEach((receiptLine) => {
    const font = getFont(receiptLine.variant);
    const lineHeight = getLineHeight(receiptLine.variant);
    context.font = font;
    context.fillStyle = "#000000";

    const text = receiptLine.text;
    const x = getTextX(context, text, receiptLine.align);
    drawCrispText(context, text, x, y);
    y += lineHeight;
  });

  return canvas.toDataURL("image/png");
}

function drawCrispText(context: CanvasRenderingContext2D, value: string, x: number, y: number): void {
  context.fillText(value, x, y);
  context.fillText(value, x + 0.45, y);
}

function getTextX(context: CanvasRenderingContext2D, value: string, align: ReceiptLine["align"]): number {
  if (align === "center") {
    return Math.max(CANVAS_PADDING_X, (CANVAS_WIDTH_PX - context.measureText(value).width) / 2);
  }
  if (align === "right") {
    return Math.max(CANVAS_PADDING_X, CANVAS_WIDTH_PX - CANVAS_PADDING_X - context.measureText(value).width);
  }
  return CANVAS_PADDING_X;
}

function calculateCanvasHeight(lines: ReceiptLine[]): number {
  return (
    CANVAS_PADDING_Y * 2 +
    lines.reduce((height, receiptLine) => height + getLineHeight(receiptLine.variant), 0)
  );
}

function getFont(variant: ReceiptLine["variant"]): string {
  if (variant === "strong") {
    return STRONG_FONT;
  }
  if (variant === "small") {
    return SMALL_FONT;
  }
  return NORMAL_FONT;
}

function getLineHeight(variant: ReceiptLine["variant"]): number {
  if (variant === "strong") {
    return STRONG_LINE_HEIGHT;
  }
  return LINE_HEIGHT;
}

function formatItem(quantity: number, productName: string, total: number): ReceiptLine[] {
  const quantityText = String(quantity);
  const totalText = formatReceiptMoney(total);
  const nameWidth = Math.max(12, RECEIPT_WIDTH_CHARS - quantityText.length - totalText.length - 2);
  const wrappedName = wrap(productName, nameWidth);
  const lines: ReceiptLine[] = [];

  lines.push(line(`${quantityText} ${padRight(wrappedName[0] ?? productName, nameWidth)} ${totalText}`));
  wrappedName.slice(1).forEach((part) => lines.push(line(`  ${part}`)));

  return lines;
}

function row(left: string, right: string): string {
  const cleanLeft = clean(left);
  const cleanRight = clean(right);
  const spaceCount = Math.max(1, RECEIPT_WIDTH_CHARS - cleanLeft.length - cleanRight.length);
  return `${cleanLeft}${" ".repeat(spaceCount)}${cleanRight}`;
}

function wrap(value: string, width: number): string[] {
  const words = clean(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    if (word.length > width) {
      if (current) {
        lines.push(current);
        current = "";
      }
      for (let index = 0; index < word.length; index += width) {
        lines.push(word.slice(index, index + width));
      }
      return;
    }

    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function padRight(value: string, width: number): string {
  const cleanValue = clean(value);
  if (cleanValue.length >= width) {
    return cleanValue;
  }
  return `${cleanValue}${" ".repeat(width - cleanValue.length)}`;
}

function separator(): ReceiptLine {
  return line("=".repeat(RECEIPT_WIDTH_CHARS), "small");
}

function blank(): ReceiptLine {
  return { text: "" };
}

function line(text: string, variant: ReceiptLine["variant"] = "normal"): ReceiptLine {
  return { text: clean(text), variant };
}

function clean(value: string): string {
  return value.replace(/\r?\n+/g, " ").replace(/\s+/g, " ").trim();
}

function formatReceiptMoney(value: number): string {
  return Math.round(Number(value || 0)).toLocaleString("es-CO");
}

function formatReceiptDate(value: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(value);
}

function formatReceiptTime(value: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Bogota",
  }).format(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
