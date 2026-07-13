import { formatCOP } from "../../../shared/utils/currency";
import { formatDateTime } from "../../../shared/utils/date";
import type { AdminOrder } from "../types/order.types";

export function PrintableInvoice({ order }: { order: AdminOrder }) {
  const isPickup = order.fulfillmentType === "PICKUP";

  return (
    <article className="thermal-invoice">
      <style>
        {`
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #ffffff; color: #111111; }
          @page { margin: 6mm; size: 80mm auto; }
          .thermal-invoice {
            width: 76mm;
            margin: 0 auto;
            padding: 4mm;
            background: #ffffff;
            color: #111111;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: 11px;
            line-height: 1.35;
          }
          .thermal-invoice h1 {
            margin: 0;
            text-align: center;
            font-size: 13px;
            font-weight: 800;
          }
          .thermal-invoice p { margin: 3px 0; overflow-wrap: anywhere; }
          .thermal-invoice table { width: 100%; border-collapse: collapse; }
          .thermal-invoice th,
          .thermal-invoice td { padding: 3px 0; vertical-align: top; }
          .thermal-invoice .center { text-align: center; }
          .thermal-invoice .total { font-size: 13px; font-weight: 800; }
          .thermal-invoice .line { border-top: 1px dashed #111111; margin: 8px 0; }
          @media print {
            .thermal-invoice { width: 76mm; }
          }
        `}
      </style>
      <h1 translate="no">ASADERO MC CHICKEN EXPRESS</h1>
      <p className="center">Factura / Pedido</p>
      <div className="line" />
      <p>No: {order.invoiceNumber ?? order.orderNumber}</p>
      <p>Fecha: {formatDateTime(order.createdAt)}</p>
      <div className="line" />
      <p>Cliente: {order.customer.fullName}</p>
      <p>Telefono: {order.customer.phone}</p>
      {isPickup ? (
        <p>Tipo: Recoge en local</p>
      ) : (
        <>
          <p>Direccion: {order.customer.address}</p>
          <p>Barrio: {order.customer.neighborhood}</p>
          <p>Pago: {order.paymentMethod}</p>
        </>
      )}
      <div className="line" />
      <table>
        <thead>
          <tr>
            <th align="left">Producto</th>
            <th align="right">Cant</th>
            <th align="right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>
                {item.productName}
                <br />
                {formatCOP(item.unitPrice)}
              </td>
              <td align="right">{item.quantity}</td>
              <td align="right">{formatCOP(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="line" />
      <p>Subtotal: {formatCOP(order.subtotal)}</p>
      <p>{isPickup ? "Recogida" : "Domicilio"}: {formatCOP(order.deliveryFee)}</p>
      <p className="total">Total: {formatCOP(order.total)}</p>
      {order.observations ? <p>Obs: {order.observations}</p> : null}
      <div className="line" />
      <p className="center">Gracias por su compra</p>
    </article>
  );
}
