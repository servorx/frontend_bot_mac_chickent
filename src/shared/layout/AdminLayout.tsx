import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useOrderRealtime } from "../../features/orders/hooks/useOrderRealtime";

const SIDEBAR_STORAGE_KEY = "asadero-sidebar-collapsed";

export function AdminLayout() {
  useOrderRealtime();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-flame focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
        href="#main-content"
      >
        Saltar al contenido
      </a>
      <div className="admin-shell flex h-dvh overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((value) => !value)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Header />
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 lg:px-8" id="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
