import { OrdersListPage } from "./OrdersListPage";

export function AcceptedOrdersPage() {
  return (
    <OrdersListPage
      emptyMessage="Los pedidos en preparacion apareceran aqui."
      emptyTitle="No hay pedidos en preparacion"
      kind="accepted"
      title="Pedidos En Preparacion"
    />
  );
}
