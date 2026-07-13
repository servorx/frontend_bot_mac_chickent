import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";

import { AuthGate } from "../../features/auth/components/AuthGate";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { ChatsPage } from "../../features/chats/pages/ChatsPage";
import { DashboardPage } from "../../features/dashboard/pages/DashboardPage";
import { FrontendMockupsPage } from "../../features/mockups/pages/FrontendMockupsPage";
import { AcceptedOrdersPage } from "../../features/orders/pages/AcceptedOrdersPage";
import { IncomingOrdersPage } from "../../features/orders/pages/IncomingOrdersPage";
import { OrderDetailPage } from "../../features/orders/pages/OrderDetailPage";
import { PickupOrdersPage } from "../../features/orders/pages/PickupOrdersPage";
import { RejectedOrdersPage } from "../../features/orders/pages/RejectedOrdersPage";
import { AdminLayout } from "../../shared/layout/AdminLayout";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/mockups", element: <FrontendMockupsPage /> },
  {
    path: "/",
    element: <AuthGate />,
    children: [
      {
        path: "/",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate replace to="/dashboard" /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "chats", element: <ChatsPage /> },
          { path: "orders/incoming", element: <IncomingOrdersPage /> },
          { path: "orders/pickup", element: <PickupOrdersPage /> },
          { path: "orders/accepted", element: <AcceptedOrdersPage /> },
          { path: "orders/rejected", element: <RejectedOrdersPage /> },
          { path: "orders/:id", element: <OrderDetailPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
