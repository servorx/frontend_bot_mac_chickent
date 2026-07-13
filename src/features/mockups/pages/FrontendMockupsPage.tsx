import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Clock3,
  Eye,
  LayoutDashboard,
  LockKeyhole,
  MessageCircle,
  PanelLeftClose,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";

const orders = [
  {
    id: "MC-0048",
    client: "Wendy",
    neighborhood: "Manantial",
    total: "$ 125.500",
    time: "Hace 2 min",
    status: "Recibido",
    payment: "Nequi",
    proof: "Comprobante visto",
  },
  {
    id: "MC-0047",
    client: "Carlos",
    neighborhood: "Lagos II",
    total: "$ 48.500",
    time: "Hace 8 min",
    status: "Pendiente",
    payment: "Transferencia",
    proof: "Falta comprobante",
  },
  {
    id: "MC-0046",
    client: "Paola",
    neighborhood: "Canaveral",
    total: "$ 78.000",
    time: "Hace 13 min",
    status: "Preparando",
    payment: "Efectivo",
    proof: "No requerido",
  },
];

const quickMessages = [
  "No contamos con 1/4 pechuga asada. Podemos enviarte pierna asada.",
  "No contamos con 3/4 dos pechugas y una pierna. Podemos cambiarlo por dos piernas y una pechuga.",
  "Las lasañas estan agotadas. Te puedo ayudar con otro producto del menu.",
];

function ShellPreview({ children, active = "Dashboard" }: { children: React.ReactNode; active?: string }) {
  const nav = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Chats", icon: MessageCircle },
    { label: "Recibidas", icon: ClipboardList },
    { label: "Preparando", icon: ChefHat },
    { label: "Canceladas", icon: XCircle },
  ];

  return (
    <div className="mock-shell">
      <aside className="mock-sidebar" aria-label="Navegacion del mockup">
        <div className="mock-brand">
          <span>ASADERO</span>
          <strong>MC Chicken</strong>
          <small>Express</small>
        </div>
        <nav className="mock-nav">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button className={item.label === active ? "mock-nav-item is-active" : "mock-nav-item"} key={item.label}>
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button className="mock-collapse">
          <PanelLeftClose size={18} aria-hidden="true" />
          Guardar panel
        </button>
      </aside>
      <main className="mock-main">{children}</main>
    </div>
  );
}

function ViewFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mock-view" aria-label={title}>
      <div className="mock-view-heading">
        <div>
          <span className="mock-kicker">Mockup de vista</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span className="mock-badge">Responsive</span>
      </div>
      {children}
    </section>
  );
}

function LoginMockup() {
  return (
    <ViewFrame
      title="Login"
      subtitle="Entrada limpia, con confianza visual y error cerca del campo para que el admin no pierda tiempo."
    >
      <div className="login-mock">
        <div className="login-copy">
          <span className="mock-kicker">Turno activo</span>
          <h3>Control de pedidos listo para cocina.</h3>
          <p>Acceso rapido para administrar WhatsApp, pagos, preparacion y despacho desde una sola consola.</p>
          <div className="login-proof">
            <ShieldCheck size={20} aria-hidden="true" />
            Sesion segura para administradores
          </div>
        </div>
        <form className="login-form">
          <div className="brand-mini">MC</div>
          <label>
            Correo
            <input defaultValue="admin@asadero.local" readOnly />
          </label>
          <label>
            Contrasena
            <input defaultValue="servor1230" type="password" readOnly />
          </label>
          <button type="button">
            <LockKeyhole size={18} aria-hidden="true" />
            Entrar al panel
          </button>
        </form>
      </div>
    </ViewFrame>
  );
}

function DashboardMockup() {
  return (
    <ViewFrame
      title="Dashboard"
      subtitle="Metricas visibles primero, pedidos nuevos arriba y alertas operativas sin abrir varias pantallas."
    >
      <ShellPreview>
        <div className="topbar">
          <div>
            <span className="mock-kicker">ASADERO MC CHICKEN EXPRESS</span>
            <h3>Centro de control</h3>
          </div>
          <div className="live-pill">
            <Bell size={16} aria-hidden="true" />
            Tiempo real conectado
          </div>
        </div>
        <div className="metric-grid">
          {[
            ["Recibidos", "12", "5 con comprobante"],
            ["Preparando", "7", "Tiempo medio 24 min"],
            ["Por cobrar", "$ 382.000", "Nequi y transferencia"],
            ["Alertas", "3", "Sin comprobante"],
          ].map(([label, value, hint]) => (
            <article className="metric-tile" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{hint}</small>
            </article>
          ))}
        </div>
        <div className="order-strip">
          <div className="section-title">
            <h4>Ultimos recibidos</h4>
            <button>Ver todos</button>
          </div>
          {orders.map((order) => (
            <article className="order-row" key={order.id}>
              <div>
                <strong>{order.id}</strong>
                <span>{order.client} · {order.neighborhood}</span>
              </div>
              <span>{order.payment}</span>
              <strong>{order.total}</strong>
              <small>{order.time}</small>
            </article>
          ))}
        </div>
      </ShellPreview>
    </ViewFrame>
  );
}

function ChatsMockup() {
  return (
    <ViewFrame
      title="Chats"
      subtitle="Conversacion tipo WhatsApp, scroll fijo, adjuntos visibles y estado del pedido al lado del mensaje."
    >
      <ShellPreview active="Chats">
        <div className="chat-layout">
          <aside className="chat-list">
            <div className="search-box">
              <Search size={18} aria-hidden="true" />
              Buscar cliente o telefono
            </div>
            {orders.map((order) => (
              <button className="chat-person" key={order.id}>
                <span>{order.client.slice(0, 1)}</span>
                <div>
                  <strong>{order.client}</strong>
                  <small>{order.id} · {order.time}</small>
                </div>
              </button>
            ))}
          </aside>
          <section className="chat-window">
            <header>
              <div>
                <strong>573022873946</strong>
                <small>Pedido MC-0048 · Recibido</small>
              </div>
              <span className="mock-badge">IA asistiendo</span>
            </header>
            <div className="messages">
              <div className="bubble customer">Hola, quiero confirmar mi pedido.</div>
              <div className="bubble bot">Pedido confirmado. Gracias por tu compra.</div>
              <div className="proof-card">
                <ReceiptText size={20} aria-hidden="true" />
                <div>
                  <strong>Comprobante Nequi</strong>
                  <span>Imagen recibida · toca para ampliar</span>
                </div>
              </div>
              <div className="bubble bot">Comprobante recibido. Ya podemos proceder con la preparacion.</div>
            </div>
            <footer>
              <input defaultValue="Escribe un mensaje al cliente..." readOnly />
              <button>
                <Send size={18} aria-hidden="true" />
                Enviar
              </button>
            </footer>
          </section>
        </div>
      </ShellPreview>
    </ViewFrame>
  );
}

function IncomingMockup() {
  return (
    <ViewFrame
      title="Recibidas"
      subtitle="Pedidos ordenados del mas nuevo al mas antiguo, bloqueo claro cuando falta comprobante y acciones grandes."
    >
      <ShellPreview active="Recibidas">
        <div className="table-toolbar">
          <div>
            <h3>Pedidos recibidos</h3>
            <p>Los nuevos entran arriba automaticamente.</p>
          </div>
          <div className="search-box wide">
            <Search size={18} aria-hidden="true" />
            Buscar pedido, cliente o barrio
          </div>
        </div>
        <div className="orders-board">
          {orders.map((order) => (
            <article className={order.proof === "Falta comprobante" ? "order-card needs-proof" : "order-card"} key={order.id}>
              <div className="order-card-main">
                <span className="order-id">{order.id}</span>
                <h4>{order.client}</h4>
                <p>{order.neighborhood} · {order.payment}</p>
                <strong>{order.total}</strong>
              </div>
              <div className="order-card-status">
                <span>{order.proof}</span>
                <small>{order.time}</small>
              </div>
              <div className="action-stack">
                <button aria-label="Ver detalle">
                  <Eye size={18} aria-hidden="true" />
                </button>
                <button className={order.proof === "Falta comprobante" ? "disabled" : "success"} aria-label="Pasar a preparando">
                  <CheckCircle2 size={18} aria-hidden="true" />
                </button>
                <button className="danger" aria-label="Cancelar">
                  <XCircle size={18} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </ShellPreview>
    </ViewFrame>
  );
}

function PreparingMockup() {
  return (
    <ViewFrame
      title="Preparando"
      subtitle="Vista para cocina: tiempos, cambios rapidos con Si/No y despacho sin ruido visual."
    >
      <ShellPreview active="Preparando">
        <div className="prep-kanban">
          <section>
            <h3>En cocina</h3>
            <article className="prep-ticket">
              <div>
                <span>MC-0048</span>
                <strong>3/4 Asado · 2 piernas y 1 pechuga</strong>
                <small>Cliente: Wendy · Manantial</small>
              </div>
              <div className="timer">
                <Clock3 size={18} aria-hidden="true" />
                25 min
              </div>
            </article>
            <article className="prep-ticket">
              <div>
                <span>MC-0046</span>
                <strong>1 Asado entero + Coca-Cola</strong>
                <small>Cliente: Paola · Canaveral</small>
              </div>
              <div className="timer urgent">
                <AlertTriangle size={18} aria-hidden="true" />
                5 min
              </div>
            </article>
          </section>
          <section className="quick-panel">
            <h3>Mensajes rapidos</h3>
            {quickMessages.map((message) => (
              <button className="quick-message" key={message}>
                <MessageCircle size={18} aria-hidden="true" />
                <span>{message}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ))}
          </section>
        </div>
      </ShellPreview>
    </ViewFrame>
  );
}

function CancelledMockup() {
  return (
    <ViewFrame
      title="Canceladas"
      subtitle="Auditoria clara: motivo, responsable, hora y opcion de recuperar conversacion."
    >
      <ShellPreview active="Canceladas">
        <div className="cancelled-list">
          {[
            ["MC-0038", "Cliente no acepto cambio de presa", "WhatsApp", "$ 68.000"],
            ["MC-0034", "No envio comprobante despues de recordatorios", "Sistema", "$ 48.500"],
          ].map(([id, reason, source, total]) => (
            <article className="cancel-card" key={id}>
              <XCircle size={22} aria-hidden="true" />
              <div>
                <strong>{id}</strong>
                <p>{reason}</p>
                <small>{source} · Hoy</small>
              </div>
              <span>{total}</span>
            </article>
          ))}
        </div>
      </ShellPreview>
    </ViewFrame>
  );
}

function DetailMockup() {
  return (
    <ViewFrame
      title="Detalle de pedido"
      subtitle="Toda la informacion importante en una pantalla: cliente, productos, pago, conversacion y acciones."
    >
      <ShellPreview active="Recibidas">
        <div className="detail-grid">
          <section className="detail-summary">
            <span className="order-id">MC-0048</span>
            <h3>Pedido de Wendy</h3>
            <p>Cra28a #195-33 · Manantial</p>
            <div className="item-list">
              <span>1 x 3/4 Asado - 2 piernas y 1 pechuga</span>
              <span>1 x Coca-Cola 1.5 L</span>
              <span>Domicilio</span>
            </div>
            <div className="total-line">
              <span>Total</span>
              <strong>$ 125.500</strong>
            </div>
          </section>
          <section className="detail-actions">
            <button className="success">
              <ChefHat size={18} aria-hidden="true" />
              Pasar a preparando
            </button>
            <button>
              <Truck size={18} aria-hidden="true" />
              Marcar despachado
            </button>
            <button className="danger">
              <XCircle size={18} aria-hidden="true" />
              Cancelar pedido
            </button>
          </section>
          <section className="detail-chat">
            <h4>Conversacion</h4>
            <div className="bubble customer">Si, confirmar.</div>
            <div className="bubble bot">Pedido confirmado. Gracias por tu compra.</div>
            <div className="quick-reply-row">
              <button>Enviar cambio con Si / No</button>
              <button>Tiempo estimado</button>
            </div>
          </section>
        </div>
      </ShellPreview>
    </ViewFrame>
  );
}

export function FrontendMockupsPage() {
  return (
    <div className="mockups-page">
      <style>{mockupStyles}</style>
      <header className="mockups-hero">
        <div>
          <span className="mock-kicker">ASADERO MC CHICKEN EXPRESS</span>
          <h1>Mockups para mejorar el frontend</h1>
          <p>
            Propuesta visual por vista: mas elegante, rapida de leer y pensada para atender pedidos sin perder
            control de pagos, chat, cocina y despacho.
          </p>
        </div>
        <div className="hero-card">
          <strong>Direccion visual</strong>
          <span>Panel operativo calido, con contraste alto, acciones grandes y datos nuevos siempre primero.</span>
        </div>
      </header>

      <LoginMockup />
      <DashboardMockup />
      <ChatsMockup />
      <IncomingMockup />
      <PreparingMockup />
      <CancelledMockup />
      <DetailMockup />
    </div>
  );
}

const mockupStyles = `
.mockups-page {
  min-height: 100dvh;
  padding: 32px;
  color: #35190f;
  background:
    linear-gradient(135deg, rgba(255,255,255,.86), rgba(255,247,229,.9)),
    repeating-linear-gradient(90deg, rgba(220,38,38,.04) 0 1px, transparent 1px 96px);
}
.mockups-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
  align-items: stretch;
  max-width: 1320px;
  margin: 0 auto 28px;
}
.mockups-hero h1, .mock-view-heading h2 {
  margin: 0;
  font-family: Chewy, Barlow, sans-serif;
  color: #c91f14;
  letter-spacing: 0;
}
.mockups-hero h1 { font-size: clamp(2.4rem, 5vw, 5rem); line-height: .9; max-width: 780px; }
.mockups-hero p, .mock-view-heading p { max-width: 780px; line-height: 1.6; color: #694431; font-weight: 600; }
.mock-kicker {
  display: inline-flex;
  color: #9f1d14;
  font-size: .75rem;
  font-weight: 900;
  letter-spacing: .18em;
  text-transform: uppercase;
}
.hero-card, .mock-view {
  border: 1px solid rgba(201, 31, 20, .18);
  background: rgba(255, 251, 242, .86);
  box-shadow: 0 18px 50px rgba(82, 39, 12, .12);
}
.hero-card {
  display: grid;
  gap: 12px;
  align-content: center;
  padding: 24px;
}
.hero-card strong { font-size: 1.2rem; }
.hero-card span { color: #694431; line-height: 1.5; }
.mock-view {
  max-width: 1320px;
  margin: 0 auto 36px;
  padding: 20px;
  border-radius: 8px;
}
.mock-view-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.mock-view-heading h2 { font-size: clamp(1.8rem, 3vw, 3rem); }
.mock-badge, .live-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 8px 12px;
  border-radius: 999px;
  color: #0d5f4a;
  background: #dbfff2;
  border: 1px solid #8ee8ca;
  font-weight: 800;
  white-space: nowrap;
}
.mock-shell {
  display: grid;
  grid-template-columns: 238px minmax(0, 1fr);
  min-height: 640px;
  overflow: hidden;
  border: 1px solid rgba(74, 31, 12, .16);
  background: #fff8e9;
}
.mock-sidebar {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 20px;
  color: #ffe9bf;
  background: linear-gradient(180deg, #37190f, #5b2117);
}
.mock-brand {
  display: grid;
  gap: 2px;
  padding: 16px;
  border: 1px solid rgba(255, 184, 28, .4);
  background: rgba(255, 184, 28, .08);
}
.mock-brand span { color: #ffcf75; font-weight: 900; font-size: .76rem; letter-spacing: .18em; }
.mock-brand strong { color: #fff7e8; font-family: Chewy, Barlow, sans-serif; font-size: 2rem; line-height: .9; }
.mock-brand small { color: #f6d9b0; font-weight: 800; text-transform: uppercase; }
.mock-nav { display: grid; gap: 8px; }
.mock-nav-item, .mock-collapse {
  min-height: 48px;
  border: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  color: #ffe9bf;
  background: transparent;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
}
.mock-nav-item:hover, .mock-collapse:hover { background: rgba(255, 255, 255, .1); transform: translateY(-1px); }
.mock-nav-item.is-active {
  color: #33170e;
  background: #ffb81c;
  box-shadow: 0 10px 24px rgba(0,0,0,.18);
}
.mock-collapse {
  margin-top: auto;
  border: 1px solid rgba(255,255,255,.18);
}
.mock-main { padding: 24px; overflow: hidden; }
.topbar, .table-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  margin-bottom: 18px;
}
.topbar h3, .table-toolbar h3 { margin: 0; font-family: Chewy, Barlow, sans-serif; color: #c91f14; font-size: 2.5rem; line-height: .9; }
.table-toolbar p { margin: 4px 0 0; color: #7a5848; font-weight: 700; }
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.metric-tile, .order-strip, .chat-window, .chat-list, .orders-board, .prep-kanban > section, .cancelled-list, .detail-summary, .detail-actions, .detail-chat, .login-form, .login-copy {
  border: 1px solid rgba(201, 31, 20, .16);
  background: rgba(255,255,255,.72);
}
.metric-tile { display: grid; gap: 8px; padding: 16px; }
.metric-tile span, .metric-tile small { color: #72503e; font-weight: 800; }
.metric-tile strong { font-size: 2rem; font-variant-numeric: tabular-nums; }
.order-strip { margin-top: 16px; padding: 16px; }
.section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.section-title h4 { margin: 0; font-size: 1.2rem; }
.section-title button, .detail-actions button, .quick-reply-row button, .login-form button, .chat-window footer button {
  min-height: 44px;
  border: 0;
  padding: 0 16px;
  background: #ffb81c;
  color: #30160e;
  font-weight: 900;
  cursor: pointer;
  transition: background-color 180ms ease, color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
}
.section-title button:hover, .detail-actions button:hover, .quick-reply-row button:hover, .login-form button:hover, .chat-window footer button:hover {
  background: #ffc847;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(74, 31, 12, .16);
}
.order-row {
  display: grid;
  grid-template-columns: minmax(160px, 1fr) 140px 120px 90px;
  align-items: center;
  gap: 10px;
  padding: 14px 0;
  border-top: 1px solid rgba(74, 31, 12, .12);
}
.order-row div { display: grid; gap: 2px; }
.order-row span, .order-row small { color: #72503e; font-weight: 700; }
.login-mock {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 18px;
  min-height: 430px;
  padding: 24px;
  background:
    linear-gradient(120deg, rgba(55,25,15,.95), rgba(112,36,24,.92)),
    linear-gradient(45deg, #fff7e8, #ffdf9a);
  color: #fff4df;
}
.login-copy { align-content: center; display: grid; gap: 16px; padding: 28px; border-color: rgba(255,255,255,.2); background: rgba(255,255,255,.08); }
.login-copy h3 { margin: 0; max-width: 640px; font-family: Chewy, Barlow, sans-serif; font-size: clamp(2rem, 4vw, 4rem); line-height: .92; color: #fff8e8; }
.login-copy p { max-width: 580px; color: #ffe2b4; line-height: 1.6; font-weight: 700; }
.login-proof { display: inline-flex; align-items: center; gap: 10px; color: #c9ffe9; font-weight: 900; }
.login-form { display: grid; align-content: center; gap: 14px; padding: 24px; background: #fff8e9; color: #35190f; }
.brand-mini { width: 58px; height: 58px; display: grid; place-items: center; background: #c91f14; color: #fff; font-weight: 900; }
.login-form label { display: grid; gap: 8px; font-weight: 900; }
.login-form input, .chat-window footer input {
  min-height: 46px;
  border: 1px solid rgba(74,31,12,.2);
  padding: 0 12px;
  color: #35190f;
  background: #fff;
  font: inherit;
}
.login-form button, .chat-window footer button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.chat-layout { display: grid; grid-template-columns: 290px minmax(0, 1fr); min-height: 560px; border: 1px solid rgba(74,31,12,.14); }
.chat-list { padding: 16px; border-width: 0 1px 0 0; background: #fffdf7; }
.search-box {
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border: 1px solid rgba(74,31,12,.18);
  color: #80604f;
  background: #fff;
  font-weight: 800;
}
.search-box.wide { min-width: min(440px, 100%); }
.chat-person {
  width: 100%;
  min-height: 72px;
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 10px;
  border: 0;
  background: #fff1d8;
  text-align: left;
  cursor: pointer;
}
.chat-person > span {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  background: #c91f14;
  color: #fff;
  font-weight: 900;
}
.chat-person div { display: grid; gap: 4px; }
.chat-person small { color: #775644; font-weight: 700; }
.chat-window { display: grid; grid-template-rows: auto 1fr auto; background: #efe4d5; }
.chat-window header, .chat-window footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  background: #fff8e9;
  border-bottom: 1px solid rgba(74,31,12,.14);
}
.chat-window header div { display: grid; gap: 3px; }
.chat-window header small { color: #745443; font-weight: 700; }
.messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: flex-end;
  min-height: 390px;
  padding: 18px;
  overflow: auto;
}
.bubble {
  max-width: 70%;
  padding: 12px 14px;
  line-height: 1.45;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(74,31,12,.08);
}
.bubble.customer { align-self: flex-start; background: #fff; }
.bubble.bot { align-self: flex-end; background: #dffbe7; }
.proof-card {
  align-self: flex-start;
  display: flex;
  gap: 12px;
  align-items: center;
  width: min(360px, 100%);
  padding: 14px;
  border: 1px solid #9bdcba;
  background: #f1fff6;
}
.proof-card div { display: grid; gap: 3px; }
.proof-card span { color: #39624d; font-weight: 700; }
.chat-window footer { border-top: 1px solid rgba(74,31,12,.14); border-bottom: 0; }
.chat-window footer input { flex: 1; }
.orders-board { display: grid; gap: 10px; padding: 12px; }
.order-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px 148px;
  gap: 14px;
  align-items: center;
  padding: 14px;
  background: #fffaf1;
  border: 1px solid rgba(74,31,12,.12);
}
.order-card.needs-proof { border-color: #dc2626; background: #fff2f0; }
.order-card-main h4 { margin: 4px 0; font-size: 1.15rem; }
.order-card-main p { margin: 0 0 8px; color: #6e5041; font-weight: 700; }
.order-id { color: #c91f14; font-weight: 950; font-size: .86rem; letter-spacing: .08em; }
.order-card-status { display: grid; gap: 6px; }
.order-card-status span { font-weight: 900; color: #185a45; }
.needs-proof .order-card-status span { color: #b91c1c; }
.action-stack { display: flex; justify-content: flex-end; gap: 8px; }
.action-stack button, .quick-message {
  min-width: 44px;
  min-height: 44px;
  border: 0;
  background: #fff;
  color: #35190f;
  cursor: pointer;
  transition: background-color 180ms ease, color 180ms ease, transform 180ms ease, border-color 180ms ease;
}
.action-stack button:hover, .quick-message:hover { transform: translateY(-1px); border-color: rgba(201, 31, 20, .28); }
.mockups-page button:focus-visible, .mockups-page input:focus-visible {
  outline: 3px solid rgba(15, 122, 93, .42);
  outline-offset: 3px;
}
.action-stack .success, .detail-actions .success { background: #0f7a5d; color: #fff; }
.action-stack .danger, .detail-actions .danger { background: #c91f14; color: #fff; }
.action-stack .disabled { background: #d7d2cb; color: #7a716a; cursor: not-allowed; }
.prep-kanban { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 14px; }
.prep-kanban > section { padding: 16px; }
.prep-kanban h3 { margin: 0 0 12px; font-family: Chewy, Barlow, sans-serif; color: #c91f14; font-size: 2rem; }
.prep-ticket {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  margin-bottom: 10px;
  background: #fffaf1;
  border-left: 5px solid #ffb81c;
}
.prep-ticket div:first-child { display: grid; gap: 5px; }
.prep-ticket span { color: #c91f14; font-weight: 950; }
.prep-ticket small { color: #765644; font-weight: 700; }
.timer {
  align-self: start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 10px;
  background: #e8fff6;
  color: #0f6b52;
  font-weight: 950;
}
.timer.urgent { background: #fff0d7; color: #a16207; }
.quick-panel { display: grid; align-content: start; gap: 10px; }
.quick-message {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 12px;
  text-align: left;
  border: 1px solid rgba(74,31,12,.12);
}
.quick-message span { font-weight: 800; line-height: 1.35; }
.cancelled-list { display: grid; gap: 12px; padding: 16px; }
.cancel-card {
  display: grid;
  grid-template-columns: 32px minmax(0,1fr) 120px;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: #fff7f4;
  border: 1px solid #ffc9c1;
}
.cancel-card svg { color: #c91f14; }
.cancel-card p { margin: 4px 0; color: #5f4030; font-weight: 800; }
.cancel-card small { color: #806252; font-weight: 700; }
.cancel-card > span { text-align: right; font-weight: 950; }
.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) 280px;
  gap: 14px;
}
.detail-summary, .detail-actions, .detail-chat { padding: 18px; }
.detail-summary h3 { margin: 8px 0 4px; font-size: 2rem; }
.detail-summary p { margin: 0 0 16px; color: #684a3b; font-weight: 700; }
.item-list { display: grid; gap: 8px; padding: 14px 0; border-top: 1px solid rgba(74,31,12,.12); border-bottom: 1px solid rgba(74,31,12,.12); }
.item-list span { font-weight: 800; }
.total-line { display: flex; justify-content: space-between; margin-top: 16px; font-size: 1.25rem; }
.detail-actions { display: grid; align-content: start; gap: 10px; }
.detail-actions button { display: flex; align-items: center; gap: 10px; justify-content: center; background: #ffb81c; }
.detail-chat { grid-column: 1 / -1; display: grid; gap: 10px; background: #efe4d5; }
.detail-chat h4 { margin: 0; font-size: 1.2rem; }
.quick-reply-row { display: flex; gap: 10px; flex-wrap: wrap; }
@media (max-width: 980px) {
  .mockups-page { padding: 18px; }
  .mockups-hero, .login-mock, .prep-kanban, .detail-grid { grid-template-columns: 1fr; }
  .mock-shell { grid-template-columns: 74px minmax(0, 1fr); }
  .mock-sidebar { padding: 12px; align-items: center; }
  .mock-brand { width: 50px; height: 50px; padding: 0; place-content: center; }
  .mock-brand span, .mock-brand small, .mock-nav-item span, .mock-collapse { display: none; }
  .mock-brand strong { font-size: 1.2rem; }
  .mock-nav-item { justify-content: center; padding: 0; width: 48px; }
  .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .chat-layout { grid-template-columns: 1fr; }
  .chat-list { border-width: 0 0 1px 0; }
  .order-card { grid-template-columns: 1fr; }
  .action-stack { justify-content: flex-start; }
}
@media (max-width: 620px) {
  .mockups-page { padding: 10px; }
  .mock-view { padding: 12px; }
  .mock-view-heading, .topbar, .table-toolbar { flex-direction: column; align-items: flex-start; }
  .mock-shell { display: block; min-height: auto; }
  .mock-sidebar { display: none; }
  .mock-main { padding: 12px; }
  .metric-grid { grid-template-columns: 1fr; }
  .order-row { grid-template-columns: 1fr; }
  .messages { min-height: 340px; }
  .bubble { max-width: 92%; }
}
`;
