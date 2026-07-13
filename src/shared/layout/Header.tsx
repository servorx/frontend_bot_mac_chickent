import { Clock } from "lucide-react";
import { NavLink } from "react-router-dom";

const mobileLinks = [
  { to: "/dashboard", label: "Inicio" },
  { to: "/orders/incoming", label: "Recibidas" },
  { to: "/orders/pickup", label: "Recoger" },
  { to: "/orders/accepted", label: "Preparando" },
  { to: "/orders/rejected", label: "Canceladas" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-orange-200 bg-[#fff8e9]/90 px-4 py-3 shadow-[0_12px_36px_rgba(106,52,18,0.1)] backdrop-blur lg:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="ops-kicker" translate="no">
              ASADERO MC CHICKEN EXPRESS
            </p>
            <h2 className="ops-title text-3xl">
              Control de pedidos
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-bone">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-2 font-semibold shadow-sm">
            <Clock aria-hidden="true" size={16} />
            Lunes a domingo, 10:00 a.m. a 4:00 p.m.
          </span>
        </div>
      </div>
      <nav aria-label="Navegacion movil" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:hidden">
        {mobileLinks.map((link) => (
          <NavLink
            className={({ isActive }) =>
              [
                "rounded-full px-3 py-2 text-center text-sm font-bold transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame",
                isActive ? "bg-flame text-ink" : "bg-white text-bone shadow-sm hover:bg-orange-50",
              ].join(" ")
            }
            key={link.to}
            to={link.to}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
