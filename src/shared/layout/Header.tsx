import { Clock } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const mobileLinks = [
  { to: "/dashboard", label: "Inicio" },
  { to: "/orders/incoming", label: "Recibidas" },
  { to: "/orders/rejected", label: "Canceladas" },
  { to: "/chats", label: "Chats" },
];

const titles = [
  { match: "/dashboard", title: "Dashboard", subtitle: "Resumen general y seguimiento de la actividad del dia." },
  { match: "/chats", title: "Chats", subtitle: "Conversaciones de WhatsApp con control de IA y atencion manual." },
  { match: "/orders/incoming", title: "Pedidos recibidos", subtitle: "Desde aqui puedes revisar, imprimir, pasar a preparacion o cancelar nuevos pedidos." },
  { match: "/orders/pickup", title: "Pedidos por recoger", subtitle: "Pedidos confirmados para atencion en mostrador." },
  { match: "/orders/accepted", title: "Preparando", subtitle: "Pedidos que cocina ya esta atendiendo." },
  { match: "/orders/rejected", title: "Canceladas", subtitle: "Historial de pedidos cancelados." },
  { match: "/orders/", title: "Detalle del pedido", subtitle: "Cliente, productos, acciones y conversacion del pedido." },
];

export function Header() {
  const location = useLocation();
  const active = titles.find((item) => location.pathname.startsWith(item.match)) ?? titles[0];

  return (
    <header className="sticky top-0 z-30 bg-transparent px-4 py-5 lg:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="ops-title text-4xl sm:text-5xl">{active.title}</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold text-bone sm:text-base">{active.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-bone">
          <span className="inline-flex items-center gap-3 rounded-lg border border-orange-200 bg-[#fff8ec]/85 px-4 py-3 font-semibold shadow-sm">
            <Clock aria-hidden="true" size={16} />
            <span>
              <span className="block text-xs text-smoke">Ultima actualizacion</span>
              Hoy 11:24 a. m.
            </span>
          </span>
        </div>
      </div>
      <nav aria-label="Navegacion movil" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden">
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
