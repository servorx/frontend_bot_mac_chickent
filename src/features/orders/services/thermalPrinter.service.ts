import qz from "qz-tray";

import { env } from "../../../config/env";
import type { DailyProductReport } from "../../dashboard/services/operation.service";
import type { AdminOrder } from "../types/order.types";
import { configureQzSecurity } from "./qzSecurity";

const RECEIPT_WIDTH = 32;
const SEPARATOR = "-".repeat(RECEIPT_WIDTH);
const BUSINESS_HEADER = [
  "ANA LUCIA PATINO RUEDA",
  "28.378.931-7",
  "MAX CHICKEN EXPRESS",
  "TELEFONO: 6488932 - 6497732",
  "CARRERA 3 # 48-06 LAGOS 2",
];

const QZ_CONNECT_TIMEOUT_MS = 15000;
const CUT_AND_FEED = "\n\n\n\x1D\x56\x42\x00";
const FALLBACK_THERMAL_PRINTER_NAMES = ["Generic / Text Only en 192.168.50.200", "Generic / Text Only"];
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

    const printer = await resolveThermalPrinter();
    const config = qz.configs.create(printer, {
      encoding: "CP437",
    });

    await qz.print(config, buildEscPosData(order));
  } catch (error) {
    console.error("QZ Tray printing failed", error);
    if (error instanceof ThermalPrinterUnavailableError) {
      throw error;
    }
    throw new ThermalPrinterUnavailableError(getPrinterFailureMessage(error));
  }
}

export async function printThermalDailyProductReport(report: DailyProductReport): Promise<void> {
  if (!env.qzTrayEnabled) {
    throw new ThermalPrinterUnavailableError("QZ Tray no esta habilitado para este despliegue.");
  }

  try {
    configureQzSecurity();
    await reconnectExistingAnonymousSession();
    if (!qz.websocket.isActive()) {
      await connectQzTray();
    }

    const printer = await resolveThermalPrinter();
    const config = qz.configs.create(printer, {
      encoding: "CP437",
    });

    await qz.print(config, buildDailyReportEscPosData(report));
  } catch (error) {
    console.error("QZ Tray daily report printing failed", error);
    if (error instanceof ThermalPrinterUnavailableError) {
      throw error;
    }
    throw new ThermalPrinterUnavailableError(getPrinterFailureMessage(error));
  }
}

async function resolveThermalPrinter(): Promise<string> {
  try {
    const defaultPrinter = await qz.printers.getDefault();
    if (defaultPrinter) {
      return defaultPrinter;
    }
  } catch (error) {
    console.warn("QZ Tray default printer lookup failed", error);
  }

  const configuredNames = env.thermalPrinterName
    .split(",")
    .map((name: string) => name.trim())
    .filter(Boolean);
  const printerNames = [...configuredNames, ...FALLBACK_THERMAL_PRINTER_NAMES];

  for (const printerName of printerNames) {
    const printer = await findPrinterByName(printerName);
    if (printer) {
      return printer;
    }
  }

  try {
    const printers = await qz.printers.find();
    const availablePrinters = Array.isArray(printers) ? printers : [printers];
    const genericPrinter = availablePrinters.find((printer) => {
      const normalizedPrinter = printer.toLowerCase();
      return normalizedPrinter.includes("generic / text only") || normalizedPrinter.includes("192.168.50.200");
    });
    if (genericPrinter) {
      return genericPrinter;
    }
  } catch (error) {
    console.warn("QZ Tray printer list lookup failed", error);
  }

  throw new ThermalPrinterUnavailableError(
    `QZ Tray esta abierto, pero no encontro una impresora termica. Configura la impresora como predeterminada o renombrala a ${env.thermalPrinterName}.`,
  );
}

async function findPrinterByName(printerName: string): Promise<string | null> {
  try {
    const printer = await qz.printers.find(printerName);
    return Array.isArray(printer) ? (printer[0] ?? null) : printer;
  } catch {
    return null;
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
  let timeoutId: number | undefined;
  try {
    await Promise.race([
      qz.websocket.connect(),
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(
            new ThermalPrinterUnavailableError(
              "QZ Tray esta abierto, pero no respondio a tiempo. Acepta el permiso de QZ si aparece y vuelve a intentar.",
            ),
          );
        }, QZ_CONNECT_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

function getPrinterFailureMessage(error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error || "");
  const normalizedDetail = detail.toLowerCase();

  if (normalizedDetail.includes("cannot find") || normalizedDetail.includes("not found")) {
    return `QZ Tray esta abierto, pero no encontro la impresora termica. Configurala como predeterminada o renombrala a ${env.thermalPrinterName}.`;
  }

  if (normalizedDetail.includes("denied") || normalizedDetail.includes("blocked") || normalizedDetail.includes("certificate")) {
    return "QZ Tray rechazo la conexion. Abre QZ Tray, permite ASADERO MC Admin y vuelve a imprimir.";
  }

  return `No se pudo enviar el ticket a ${env.thermalPrinterName}. Si macOS muestra la impresora como inactiva, eso solo significa en reposo; revisa QZ Tray o vuelve a intentar.`;
}

function buildEscPosData(order: AdminOrder): string[] {
  const receipt = buildReceiptText(order);
  return [
    "\x1B\x40",
    "\x1B\x74\x00",
    "\x1B\x21\x00",
    receipt,
    CUT_AND_FEED,
    "\x1B\x40",
    receipt,
    CUT_AND_FEED,
  ];
}

function buildDailyReportEscPosData(report: DailyProductReport): string[] {
  return [
    "\x1B\x40",
    "\x1B\x74\x00",
    "\x1B\x21\x00",
    buildDailyReportText(report),
    CUT_AND_FEED,
  ];
}

function buildReceiptText(order: AdminOrder): string {
  const createdAt = new Date(order.createdAt);
  const isPickup = order.fulfillmentType === "PICKUP";
  const location = splitDeliveryLocation(order.customer.address, order.customer.neighborhood);
  const lines: string[] = [];

  lines.push(...BUSINESS_HEADER.map(center));
  lines.push("");
  lines.push(`${"Cant Detalle".padEnd(RECEIPT_WIDTH - 6, " ")}Dinero`);
  lines.push(SEPARATOR);

  order.items.forEach((item) => {
    lines.push(...itemLines(item.quantity, item.productName, item.subtotal));
  });

  if (!isPickup && order.deliveryFee > 0) {
    lines.push(...itemLines(1, "Domicilio", order.deliveryFee));
  }

  lines.push(SEPARATOR);
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
        ["Direccion", location.address],
        ["Barrio", location.neighborhood],
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

function buildDailyReportText(report: DailyProductReport): string {
  const lines: string[] = [];
  const generatedAt = new Date(report.generatedAt);

  lines.push(...BUSINESS_HEADER.map(center));
  lines.push("");
  lines.push(center("REPORTE DIARIO"));
  lines.push(center(`FECHA ${formatReportDate(report.date)}`));
  lines.push(SEPARATOR);
  lines.push(`${"Producto".padEnd(RECEIPT_WIDTH - 13, " ")}Cant Total`);
  lines.push(SEPARATOR);

  if (report.items.length === 0) {
    lines.push(center("Sin productos vendidos"));
  } else {
    report.items.forEach((item, index) => {
      lines.push(...reportItemLines(index + 1, item.productName, item.quantity, item.totalCop));
    });
  }

  lines.push(SEPARATOR);
  lines.push(row("Unidades", String(report.totalQuantity)));
  lines.push(row("*** TOTAL ***", money(report.totalCop)));
  lines.push("");
  lines.push(`Generado: ${formatDate(generatedAt)} ${formatTime(generatedAt)}`);
  lines.push(center("SIN DOMICILIOS"));

  return `${lines.map(plain).join("\n")}\n`;
}

function splitDeliveryLocation(address: string, neighborhood: string): { address: string; neighborhood: string } {
  const cleanAddress = plain(address);
  const cleanNeighborhood = plain(neighborhood);
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

function reportItemLines(index: number, name: string, quantity: number, total: number): string[] {
  const prefix = `${index} `;
  const quantityText = String(quantity).padStart(3, " ");
  const totalText = money(total).padStart(8, " ");
  const nameWidth = Math.max(8, RECEIPT_WIDTH - prefix.length - quantityText.length - totalText.length - 2);
  const wrapped = wrap(name, nameWidth);
  return [
    `${prefix}${wrapped[0].padEnd(nameWidth, " ")} ${quantityText} ${totalText}`,
    ...wrapped.slice(1).map((line) => `${" ".repeat(prefix.length)}${line}`),
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

function formatReportDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatTime(value: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Bogota",
  }).format(value);
}
