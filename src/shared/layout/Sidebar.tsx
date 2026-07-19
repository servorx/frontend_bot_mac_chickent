import {
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { useOrders } from "../../features/orders/hooks/useOrders";
import type { AdminOrder, OrderListKind } from "../../features/orders/types/order.types";
import { AnimatedChickenImage, AnimatedRoastChickenImage, BrandLogo } from "../components/BrandLogo";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chats", label: "Chats", icon: MessageCircle },
  { to: "/orders/incoming", label: "Recibidas", icon: ClipboardList, badgeKind: "incoming" },
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
  const [seenAtByKind, setSeenAtByKind] = useState<Record<"incoming", string>>(() => ({
    incoming: localStorage.getItem("orders:last-seen:incoming") ?? "",
  }));

  const pendingOrders = useMemo(
    () => ({
      incoming: incomingOrders.data ?? [],
    }),
    [incomingOrders.data],
  );

  useEffect(() => {
    const activeKind = location.pathname.startsWith("/orders/incoming")
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
    }),
    [pendingOrders, seenAtByKind],
  );

  return (
    <aside
      className={[
        "relative hidden h-dvh shrink-0 overflow-hidden border-r border-orange-200/80 bg-[#fffdf7]/95 p-5 text-paper shadow-[18px_0_44px_rgba(106,52,18,0.08)] transition-[width] duration-200 lg:block",
        isCollapsed ? "w-20" : "w-72",
      ].join(" ")}
    >
      <div
        className={[
          "mb-7 flex border-b border-orange-200 pb-6",
          isCollapsed ? "items-center justify-center" : "items-start justify-between gap-3",
        ].join(" ")}
      >
        {!isCollapsed ? (
          <BrandLogo />
        ) : null}
        <button
          aria-label={isCollapsed ? "Mostrar menu lateral" : "Guardar menu lateral"}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-orange-200 bg-white text-bone transition-colors hover:bg-[#fff2d8] hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame"
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
                "relative flex min-h-14 items-center rounded-lg text-sm font-extrabold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame",
                isCollapsed ? "justify-center px-2" : "gap-3 px-4",
                isActive
                  ? "bg-[#fff2d8] text-ember shadow-[0_10px_24px_rgba(106,52,18,0.09)] ring-1 ring-orange-200"
                  : "text-paper hover:bg-white hover:text-ember",
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
                  "ml-auto grid min-h-6 min-w-6 place-items-center rounded-full bg-ember px-2 text-xs font-black text-white shadow-sm",
                  isCollapsed ? "absolute translate-x-4 -translate-y-4" : "",
                ].join(" ")}
              >
                {badgeCounts[link.badgeKind]}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>
      {!isCollapsed ? (
        <div className="absolute bottom-5 left-5 right-5 overflow-hidden rounded-lg border border-orange-200 bg-[#fff8ec] p-3 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="grid h-16 w-20 shrink-0 place-items-center">
              <AnimatedRoastChickenImage className="h-16 w-24" />
            </div>
            <p className="text-sm font-extrabold leading-5 text-paper">
              El mejor pollo
              <span className="block">para compartir</span>
              <span className="text-ember">♡</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-5 left-0 right-0 grid place-items-center">
          <AnimatedChickenImage className="h-11 w-11" />
        </div>
      )}
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
