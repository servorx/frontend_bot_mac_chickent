import qz from "qz-tray";

import { env } from "../../../config/env";
import type { AdminOrder } from "../types/order.types";
import { configureQzSecurity } from "./qzSecurity";

const RECEIPT_WIDTH = 40;
const BUSINESS_HEADER = [
  "ANA LUCIA PATINO RUEDA",
  "28.378.931-7",
  "MAX CHICKEN EXPRESS",
  "TELEFONO: 6488932 - 6497732",
  "CARRERA 3 # 48-06 LAGOS 2",
];

const QZ_CONNECT_TIMEOUT_MS = 1200;
const CUT_FEED = "\n\n\n\n\n\n";
let signedReconnectAttempted = false;

export class ThermalPrinterUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ThermalPrinterUnavailableError";
  }
}

export function isThermalPrinterEnabled(): boolean {
  return env.qzTrayEnabled;
}

export async function printThermalOrder(order: AdminOrder): Promise<void> {
  if (!env.qzTrayEnabled) {
    throw new ThermalPrinterUnavailableError("QZ Tray no esta habilitado para este despliegue.");
  }

  try {
    configureQzSecurity();
    await reconnectExistingAnonymousSession();
    if (!qz.websocket.isActive()) {
      await connectQzTray();
    }

    const printer = await qz.printers.find(env.thermalPrinterName);
    const config = qz.configs.create(printer, {
      encoding: "CP437",
    });

    await qz.print(config, buildEscPosData(order));
  } catch (error) {
    console.error("QZ Tray printing failed", error);
    throw new ThermalPrinterUnavailableError(
      `No se pudo imprimir por QZ Tray en ${env.thermalPrinterName}. Verifica que QZ Tray este instalado, abierto y que la impresora tenga ese nombre.`,
    );
  }
}

async function reconnectExistingAnonymousSession(): Promise<void> {
  if (signedReconnectAttempted || !qz.websocket.isActive()) {
    return;
  }
  signedReconnectAttempted = true;
  try {
    await qz.websocket.disconnect();
  } catch (error) {
    console.warn("QZ Tray disconnect before signed reconnect failed", error);
  }
}

async function connectQzTray(): Promise<void> {
  await Promise.race([
    qz.websocket.connect(),
    new Promise<never>((_, reject) => {
      window.setTimeout(() => {
        reject(new ThermalPrinterUnavailableError("QZ Tray no respondio a tiempo."));
      }, QZ_CONNECT_TIMEOUT_MS);
    }),
  ]);
}

function buildEscPosData(order: AdminOrder): string[] {
  const receipt = buildReceiptText(order);
  return [
    "\x1B\x40",
    "\x1B\x74\x00",
    "\x1B\x21\x00",
    receipt,
    CUT_FEED,
    "\x1D\x56\x00",
    "\x1B\x40",
    receipt,
    CUT_FEED,
    "\x1D\x56\x00",
  ];
}

function buildReceiptText(order: AdminOrder): string {
  const createdAt = new Date(order.createdAt);
  const isPickup = order.fulfillmentType === "PICKUP";
  const lines: string[] = [];

  lines.push(...BUSINESS_HEADER.map(center));
  lines.push("");
  lines.push(`${"Cant Detalle".padEnd(RECEIPT_WIDTH - 6, " ")}Dinero`);
  lines.push("=".repeat(RECEIPT_WIDTH));

  order.items.forEach((item) => {
    lines.push(...itemLines(item.quantity, item.productName, item.subtotal));
  });

  if (!isPickup && order.deliveryFee > 0) {
    const neighborhood = plain(order.customer.neighborhood || "");
    lines.push(...itemLines(1, neighborhood ? `Domicilio ${neighborhood}` : "Domicilio", order.deliveryFee));
  }

  lines.push("=".repeat(RECEIPT_WIDTH));
  lines.push(row("*** TOTAL ***", money(order.total)));
  lines.push(row(isPickup ? "Recoge" : order.paymentMethod, money(order.total)));
  lines.push(row("Completo", "0"));
  lines.push("");
  lines.push(`FECHA: ${formatDate(createdAt)} HORA: ${formatTime(createdAt)}`);
  lines.push("Mesa: -");

  const customerLines = isPickup
    ? [
        ["Nombre", order.customer.fullName],
        ["Telefono", order.customer.phone],
        ["Tipo", "Recoge en local"],
        ["Nota", order.observations || "Sin nota"],
      ]
    : [
        ["Nombre", order.customer.fullName],
        ["Telefono", order.customer.phone],
        ["Direccion", order.customer.address],
        ["Barrio", order.customer.neighborhood],
        ["Pago", order.paymentMethod],
        ["Nota", order.observations || "Sin nota"],
      ];

  customerLines.forEach(([label, value]) => {
    lines.push(...labeledLines(label, value));
  });

  lines.push("");
  lines.push(center("<<< REGIMEN SIMPLIFICADO >>>"));
  lines.push(center("GRACIAS POR SU COMPRA"));

  return `${lines.map(plain).join("\n")}\n`;
}

function itemLines(quantity: number, name: string, total: number): string[] {
  const quantityText = String(quantity);
  const totalText = money(total);
  const nameWidth = Math.max(12, RECEIPT_WIDTH - quantityText.length - totalText.length - 2);
  const wrapped = wrap(name, nameWidth);
  return [
    `${quantityText} ${wrapped[0].padEnd(nameWidth, " ")} ${totalText}`,
    ...wrapped.slice(1).map((line) => `  ${line}`),
  ];
}

function labeledLines(label: string, value: string): string[] {
  const cleanLabel = `${plain(label)}:`;
  const cleanValue = plain(value || "-") || "-";
  const firstPrefix = `${cleanLabel} `;
  const continuationPrefix = " ".repeat(firstPrefix.length);
  const firstWidth = RECEIPT_WIDTH - firstPrefix.length;
  const wrapped = wrap(cleanValue, Math.max(8, firstWidth));
  const lines = [`${firstPrefix}${wrapped[0]}`];

  wrapped.slice(1).forEach((line) => {
    lines.push(`${continuationPrefix}${line}`);
  });

  return lines;
}

function row(left: string, right: string): string {
  const cleanLeft = plain(left);
  const cleanRight = plain(right);
  const spaces = Math.max(1, RECEIPT_WIDTH - cleanLeft.length - cleanRight.length);
  return `${cleanLeft}${" ".repeat(spaces)}${cleanRight}`;
}

function wrap(value: string, width: number): string[] {
  const words = plain(value).split(/\s+/).filter(Boolean);
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

function center(value: string): string {
  const text = plain(value);
  const leftPadding = Math.max(0, Math.floor((RECEIPT_WIDTH - text.length) / 2));
  return `${" ".repeat(leftPadding)}${text}`;
}

function plain(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function money(value: number): string {
  return Math.round(value).toLocaleString("es-CO");
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(value);
}

function formatTime(value: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Bogota",
  }).format(value);
}
