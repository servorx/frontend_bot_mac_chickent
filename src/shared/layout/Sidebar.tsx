import {
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  PackageCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Printer,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { useOrders } from "../../features/orders/hooks/useOrders";
import type { AdminOrder, OrderListKind } from "../../features/orders/types/order.types";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chats", label: "Chats", icon: MessageCircle },
  { to: "/orders/incoming", label: "Recibidas", icon: ClipboardList, badgeKind: "incoming" },
  { to: "/orders/pickup", label: "Por recoger", icon: PackageCheck, badgeKind: "pickup" },
  { to: "/orders/accepted", label: "Preparando", icon: Printer },
  { to: "/orders/rejected", label: "Canceladas", icon: XCircle },
] satisfies Array<{
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  badgeKind?: Extract<OrderListKind, "incoming" | "pickup">;
}>;

type SidebarProps = {
  isCollapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const incomingOrders = useOrders("incoming");
  const pickupOrders = useOrders("pickup");
  const [seenAtByKind, setSeenAtByKind] = useState<Record<"incoming" | "pickup", string>>(() => ({
    incoming: localStorage.getItem("orders:last-seen:incoming") ?? "",
    pickup: localStorage.getItem("orders:last-seen:pickup") ?? "",
  }));

  const pendingOrders = useMemo(
    () => ({
      incoming: incomingOrders.data ?? [],
      pickup: pickupOrders.data ?? [],
    }),
    [incomingOrders.data, pickupOrders.data],
  );

  useEffect(() => {
    const activeKind = location.pathname.startsWith("/orders/pickup")
      ? "pickup"
      : location.pathname.startsWith("/orders/incoming")
        ? "incoming"
        : null;

    if (!activeKind) {
      return;
    }

    const latestCreatedAt = getLatestCreatedAt(pendingOrders[activeKind]);
    if (!latestCreatedAt) {
      return;
    }

    localStorage.setItem(`orders:last-seen:${activeKind}`, latestCreatedAt);
    setSeenAtByKind((current) => {
      if (current[activeKind] === latestCreatedAt) {
        return current;
      }
      return { ...current, [activeKind]: latestCreatedAt };
    });
  }, [location.pathname, pendingOrders]);

  const badgeCounts = useMemo(
    () => ({
      incoming: countUnseenOrders(pendingOrders.incoming, seenAtByKind.incoming),
      pickup: countUnseenOrders(pendingOrders.pickup, seenAtByKind.pickup),
    }),
    [pendingOrders, seenAtByKind],
  );

  return (
    <aside
      className={[
        "hidden h-dvh shrink-0 overflow-hidden border-r border-[#6f2b1d]/50 bg-gradient-to-b from-[#37190f] to-[#5b2117] p-4 text-[#ffe9bf] shadow-[18px_0_44px_rgba(74,31,12,0.16)] transition-[width] duration-200 lg:block",
        isCollapsed ? "w-20" : "w-72",
      ].join(" ")}
    >
      <div
        className={[
          "mb-7 flex rounded-lg border border-[#ffb81c]/40 bg-[#ffb81c]/10 shadow-[0_16px_30px_rgba(0,0,0,0.16)]",
          isCollapsed ? "items-center justify-center p-3" : "items-start justify-between gap-3 p-4",
        ].join(" ")}
      >
        {!isCollapsed ? (
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#ffcf75]" translate="no">
              ASADERO
            </p>
            <h1 className="mt-1 font-display text-4xl leading-none text-[#fff7e8]" translate="no">
              MC Chicken
            </h1>
            <p className="mt-1 text-sm font-extrabold uppercase tracking-wide text-[#f6d9b0]">
              Express
            </p>
          </div>
        ) : null}
        <button
          aria-label={isCollapsed ? "Mostrar menu lateral" : "Guardar menu lateral"}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-[#ffb81c]/40 bg-[#fff8e9] text-ember transition-colors hover:bg-flame hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame"
          title={isCollapsed ? "Mostrar menu" : "Guardar menu"}
          onClick={onToggle}
          type="button"
        >
          {isCollapsed ? <PanelLeftOpen aria-hidden="true" size={18} /> : <PanelLeftClose aria-hidden="true" size={18} />}
        </button>
      </div>
      <nav aria-label={isCollapsed ? "Navegacion principal compacta" : "Navegacion principal"} className="space-y-2">
        {links.map((link) => (
          <NavLink
            aria-label={isCollapsed ? link.label : undefined}
            className={({ isActive }) =>
              [
                "relative flex min-h-12 items-center rounded-md text-sm font-bold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame",
                isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                isActive
                  ? "bg-flame text-ink shadow-[0_12px_24px_rgba(0,0,0,0.22)]"
                  : "text-[#ffe9bf] hover:bg-white/10 hover:text-white",
              ].join(" ")
            }
            key={link.to}
            title={isCollapsed ? link.label : undefined}
            to={link.to}
          >
            <link.icon aria-hidden="true" size={20} />
            {isCollapsed ? <span className="sr-only">{link.label}</span> : <span>{link.label}</span>}
            {link.badgeKind && badgeCounts[link.badgeKind] > 0 ? (
              <span
                className={[
                  "ml-auto grid min-h-6 min-w-6 place-items-center rounded-full bg-[#fff8e9] px-2 text-xs font-black text-ember shadow-sm",
                  isCollapsed ? "absolute translate-x-4 -translate-y-4" : "",
                ].join(" ")}
              >
                {badgeCounts[link.badgeKind]}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function getLatestCreatedAt(orders: AdminOrder[]) {
  return orders.reduce<string>((latest, order) => {
    if (!latest || new Date(order.createdAt).getTime() > new Date(latest).getTime()) {
      return order.createdAt;
    }
    return latest;
  }, "");
}

function countUnseenOrders(orders: AdminOrder[], seenAt: string) {
  if (!seenAt) {
    return orders.length;
  }
  const seenTime = new Date(seenAt).getTime();
  return orders.filter((order) => new Date(order.createdAt).getTime() > seenTime).length;
}
