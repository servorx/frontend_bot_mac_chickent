import { OrdersListPage } from "./OrdersListPage";

export function RejectedOrdersPage() {
  return (
    <OrdersListPage
      emptyMessage="Los pedidos cancelados apareceran aqui con su motivo si fue registrado."
      emptyTitle="No hay pedidos cancelados"
      kind="rejected"
      title="Pedidos Cancelados"
    />
  );
}
