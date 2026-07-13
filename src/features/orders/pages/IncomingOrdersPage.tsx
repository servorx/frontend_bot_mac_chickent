import { OrdersListPage } from "./OrdersListPage";

export function IncomingOrdersPage() {
  return (
    <OrdersListPage
      emptyMessage="Cuando un cliente confirme desde WhatsApp, aparecera aqui para gestionarlo."
      emptyTitle="No hay pedidos recibidos"
      kind="incoming"
      title="Pedidos Recibidos"
    />
  );
}
