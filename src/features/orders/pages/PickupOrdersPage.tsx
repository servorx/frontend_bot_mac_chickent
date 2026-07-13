import { OrdersListPage } from "./OrdersListPage";

export function PickupOrdersPage() {
  return (
    <OrdersListPage
      emptyMessage="Cuando un cliente confirme que pasa a recoger, aparecera aqui para gestionarlo."
      emptyTitle="No hay pedidos por recoger"
      kind="pickup"
      title="Pedidos Por Recoger"
    />
  );
}
