import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Navigate,
  Outlet,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Calendar,
  ExternalLink,
  FileText,
  Handshake,
  Home,
  MapPin,
  Megaphone,
  MessageCircle,
  PackageCheck,
  Send,
  ShoppingCart,
  Star,
  User,
} from "lucide-react";
import { useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { CommitmentForm } from "./components/CommitmentForm";
import { CommitmentList } from "./components/CommitmentList";
import { ConnectWalletButton } from "./components/ConnectWalletButton";
import { DemandCard, type DemandRow } from "./components/DemandCard";
import { DemandForm } from "./components/DemandForm";
import { ProgressBar } from "./components/ProgressBar";
import { Navbar, RoleSelector } from "./components/RoleSelector";
import {
  ADMIN_ADDRESS,
  CONSOLIDATION_POOL_ABI,
  CONSOLIDATION_POOL_ADDRESS,
  formatMXN,
  MASA_MXN_ABI,
  MASA_MXN_ADDRESS,
  parseMXN,
} from "./lib/contracts";
import { useDemoStore } from "./lib/demoStore";
import { shouldShowDemand } from "./lib/demoFilter";
import { getDisconnectPreference } from "./lib/disconnectPreference";
import {
  clearDbOverrides,
  findCampaignByTitle,
  findMockAccount,
  getDbOverridesJson,
  getDemoAccountForRole,
  getMockAccounts,
  mockAccounts,
  saveDbOverrides,
} from "./lib/mockDb";
import { clearRole, getRole, type Role, setRole } from "./lib/role";
import { type MintInput, mintSchema } from "./lib/schemas";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as const;

function useAuthGuard() {
  const { isConnected, isReconnecting, address } = useAccount();
  const disconnected = getDisconnectPreference();
  const role = getRole();

  if (isReconnecting && !disconnected) return { status: "loading" as const };
  if (!isConnected || disconnected) return { status: "redirect" as const };
  if (!role) return { status: "no-role" as const };
  return {
    status: "ok" as const,
    role,
    address: address ?? ZERO_ADDR,
  };
}

function RootLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}

function HomePage() {
  const { isConnected } = useAccount();
  const isLoggedIn = isConnected && !getDisconnectPreference();

  const trustedLogos = [
    { name: "Alsea", src: "/brand-logos/alsea.svg" },
    { name: "Starbucks", src: "/brand-logos/starbucks-wordmark.png" },
    { name: "OXXO", src: "/brand-logos/oxxo.svg" },
    { name: "Chedraui", src: "/brand-logos/chedraui.svg" },
    { name: "Walmart México y Centroamérica", src: "/brand-logos/walmart-mx.svg" },
  ];

  const impactItems = [
    {
      tone: "green",
      title: "Negocios pequeños, potencial grande",
      text: "Ayudamos a llegar a mercados que antes parecían fuera de alcance.",
    },
    {
      tone: "yellow",
      title: "Ofertas colectivas, mayor impacto",
      text: "Unimos volumen, demanda y confianza para alcanzar masa crítica.",
    },
    {
      tone: "purple",
      title: "Más exposición, más crecimiento",
      text: "Haz visible tu oferta ante compradores con capacidad real de compra.",
    },
    {
      tone: "green",
      title: "Bueno para vender, bueno para la comunidad",
      text: "Impulsamos compras locales, éticas y más sostenibles.",
    },
  ];

  return (
    <div className="landing-page">
      <section className="landing-section" id="hero">
        <header className="landing-header" aria-label="Masa Critica navigation">
          <a className="landing-brand" href="#hero" aria-label="Masa Critica home">
            <img
              src="/masa_critica_logo_icon_transparent.png"
              alt=""
              className="landing-logo"
            />
            <span>Masa Crítica</span>
          </a>
          <nav className="landing-nav" aria-label="Primary">
            <a href="#proveedores">Para proveedores</a>
            <a href="#compradores">Para compradores</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#impacto">Impacto</a>
            <a href="#nosotros">Nosotros</a>
          </nav>
          <div className="landing-wallet" id="connect">
            <ConnectWalletButton connectedAction="app" preferredOnly />
          </div>
        </header>

        <div className="landing-hero">
          <div className="hero-main">
            <div className="hero-copy">
              <h1>
                Desbloquea{" "}
                <span className="hero-word hero-word-green">exposición</span>{" "}
                <span className="hero-word hero-word-purple">como nunca antes</span>
              </h1>
              <p className="hero-subtitle">
                Masa Crítica conecta negocios pequeños con grandes oportunidades al
                combinar ofertas, alcanzar volumen colectivo y abrir acceso a compradores
                que antes parecían lejanos.
              </p>
              <div className="hero-actions">
                <a className="hero-primary" href={isLoggedIn ? "/app" : "#connect"}>
                  {isLoggedIn ? "Ir a la app" : "Soy proveedor"}
                  <span aria-hidden="true">→</span>
                </a>
                <a className="hero-secondary" href={isLoggedIn ? "/app" : "#connect"}>
                  Soy comprador
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            <div className="hero-image-frame">
              <img
                className="hero-collage"
                src="/hero-collage.png"
                alt="Collage de productos y productores alrededor del logo de Masa Crítica"
              />
            </div>
          </div>

          <section className="trusted-strip" aria-label="Empresas de referencia">
            <p>
              Grandes distribuidores
              <span>confían en nosotros</span>
            </p>
            <div className="trusted-logos">
              {trustedLogos.map((logo) => (
                <img key={logo.name} src={logo.src} alt={logo.name} />
              ))}
            </div>
            <span className="trusted-more">y más...</span>
          </section>
        </div>
      </section>

      <section className="impact-grid" id="impacto" aria-label="Impacto">
        {impactItems.map((item) => (
          <article className="impact-item" key={item.title}>
            <span className={`impact-icon impact-${item.tone}`} />
            <div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      <footer className="landing-footer">
        <span>© 2026 Masa Crítica</span>
        <a
          href="https://testnet.monadvision.com/token/0xD34E7d8ad6316E112e6df273c6C7b5b5004B8795"
          rel="noreferrer"
          target="_blank"
        >
          mMXN explorer
        </a>
        <a href="/app">App</a>
        <a href="/admin">Admin</a>
      </footer>
    </div>
  );
}

function AppPage() {
  const guard = useAuthGuard();
  const router = useRouter();

  if (guard.status === "loading") {
    return <div className="app-shell">Checking wallet...</div>;
  }
  if (guard.status === "redirect") {
    return <Navigate replace to="/" />;
  }
  if (guard.status === "no-role") {
    return (
      <div className="page-stack">
        <p>Elige tu rol:</p>
        <RoleSelector
          onSelect={(r) => {
            setRole(r);
            router.invalidate();
          }}
        />
      </div>
    );
  }

  const { role } = guard;

  return role === "distributor" ? <DistributorDashboard /> : <SupplierDashboard />;
}

function DistributorDashboard() {
  return <DemoDashboard role="distributor" />;
}

function SupplierDashboard() {
  return <DemoDashboard role="supplier" />;
}

type DemoOpportunity = {
  title: string;
  buyer: string;
  location: string;
  deadline: string;
  description: string;
  target: string;
  committed: string;
  remaining: string;
  progress: number;
  status: "Activa" | "Proxima" | "Cerrada";
  providers: number;
  imageUrl?: string;
  imageClass: string;
  action: "details" | "reminder";
};

const demoOpportunities: DemoOpportunity[] = [
  {
    title: "Bebidas naturales para cafeterias",
    buyer: "Cadenas de cafeterias",
    location: "Entrega en Jalisco",
    deadline: "30 Jun 2026",
    description:
      "Buscamos bebidas naturales, listas para refrigerador, con empaque individual y 3+ meses de vida de anaquel.",
    target: "$300,000",
    committed: "$185,000 comprometido",
    remaining: "$115,000 restante",
    progress: 62,
    status: "Activa",
    providers: 11,
    imageUrl: "/hero-collage.png",
    imageClass: "opportunity-photo-collage",
    action: "details",
  },
  {
    title: "Snacks saludables para OXXO",
    buyer: "OXXO",
    location: "Entrega Nacional",
    deadline: "15 Jul 2026",
    description:
      "Snacks saludables, empaques individuales, con certificaciones basicas.",
    target: "$500,000",
    committed: "$140,000 comprometido",
    remaining: "$360,000 restante",
    progress: 28,
    status: "Activa",
    providers: 8,
    imageClass: "opportunity-photo-snacks",
    action: "details",
  },
  {
    title: "Lacteos artesanales premium",
    buyer: "Hoteles y restaurantes",
    location: "CDMX y Area Metropolitana",
    deadline: "01 Ago 2026",
    description: "Quesos, yogures y lacteos artesanales de alta calidad.",
    target: "$250,000",
    committed: "Apertura: 10 May 2026",
    remaining: "Lista de espera",
    progress: 0,
    status: "Proxima",
    providers: 0,
    imageClass: "opportunity-photo-dairy",
    action: "reminder",
  },
];

function DemoDashboard({ role }: { role: Role }) {
  const { address } = useAccount();
  const router = useRouter();
  const account = findMockAccount(address) ?? getDemoAccountForRole(role);
  const allAccounts = getMockAccounts();
  const buyerAccount =
    allAccounts.find((item) => item.kind === "buyer") ?? getDemoAccountForRole("distributor");
  const producerAccount =
    allAccounts.find((item) => item.kind === "producer") ?? getDemoAccountForRole("supplier");
  const greeting = `Hola, ${account.displayName}!`;

  return (
    <div className="demo-app">
      <aside className="demo-sidebar" aria-label="Principal">
        <Link className="demo-brand" to="/">
          <img src="/masa_critica_logo_icon_transparent.png" alt="" />
          <span>Masa Critica</span>
        </Link>
        <nav className="demo-nav">
          <a className="active" href="/app">
            <Home size={20} strokeWidth={1.9} />
            Inicio
          </a>
          <a href="/app#opportunities">
            <PackageCheck size={20} strokeWidth={1.9} />
            Oportunidades
          </a>
          <a href="/app#offers">
            <Send size={20} strokeWidth={1.9} />
            Mis ofertas
          </a>
          <a href="/app#commitments">
            <Handshake size={20} strokeWidth={1.9} />
            Mis compromisos
          </a>
          <a href="/app/settings">
            <User size={20} strokeWidth={1.9} />
            Perfil
          </a>
        </nav>
        <div className="buyer-card">
          <strong>¿Eres comprador?</strong>
          <p>Publica una oportunidad de compra y recibe ofertas.</p>
          <Link className="demo-secondary-button" to="/app/demand/new">
            Publicar oportunidad
          </Link>
        </div>
        <div className="demo-user">
          <span>{account.initials}</span>
          <div>
            <strong>{account.displayName}</strong>
            <small>{account.verification.label}</small>
          </div>
        </div>
      </aside>

      <section className="demo-main">
        <header className="demo-topbar">
          <div>
            <h1>{greeting} <span aria-hidden="true">👋</span></h1>
            <p>Conecta tu produccion con grandes oportunidades.</p>
          </div>
          <div className="demo-wallet-row">
            <span className="demo-bell">
              <Bell size={22} strokeWidth={1.9} />
              <b>3</b>
            </span>
            <span className="demo-pill">
              <i />
              Monad Testnet
            </span>
            <span className="demo-address">
              <span className="demo-token-dot" />
              {shortDemoAddress(account.address)}
            </span>
          </div>
        </header>

        <div className="demo-grid">
          <div className="demo-left">
            <section className="demo-hero">
              <div>
                <h2>Convierte tu capacidad en oportunidades reales</h2>
                <p>
                  Unete a oportunidades de compra de alto volumen y crece junto a
                  otros productores.
                </p>
                <div className="demo-hero-actions">
                  <a className="demo-primary-button" href="#opportunities">
                    Ver oportunidades <ArrowRight size={18} strokeWidth={2.4} />
                  </a>
                  <Link className="demo-light-button" to="/app/demand/new">
                    Crear campaña
                  </Link>
                </div>
              </div>
              <img
                src="/hero-collage.png"
                alt="Productos y productores de Masa Critica"
              />
            </section>

            <section className="opportunities" id="opportunities">
              <div className="section-heading">
                <h2>Oportunidades activas</h2>
                <span>Ver todas</span>
              </div>
              <LiveOpportunityList router={router} />
            </section>
          </div>

          <aside className="demo-right">
            <section className="demo-panel">
              <h2>Mi progreso</h2>
              <p>Comprometido este mes</p>
              <div className="progress-total">
                <strong>$185,000 <small>MXN</small></strong>
                <span>de $300,000</span>
              </div>
              <div className="demo-progress-track">
                <span style={{ width: "62%" }} />
              </div>
              <div className="progress-stats">
                <strong>3<span>Oportunidades activas</span></strong>
                <strong>2<span>Ofertas enviadas</span></strong>
                <strong>1<span>Compromiso activo</span></strong>
              </div>
            </section>

            <section className="demo-panel">
              <div className="section-heading">
                <h2>Actividad reciente</h2>
                <span>Ver todo</span>
              </div>
              <ActivityList />
            </section>

            <section className="demo-panel" id="commitments">
              <div className="section-heading">
                <h2>Compromisos en blockchain</h2>
                <a
                  href="https://testnet.monadvision.com/address/0xDCDCE6B9d60b22F2bF3bd5fAC7d33E60eb1eC197"
                  rel="noreferrer"
                  target="_blank"
                >
                  Ver explorer <ExternalLink size={15} strokeWidth={2.2} />
                </a>
              </div>
              <div className="chain-card">
                <span>Compromiso activo</span>
                <div>
                  <strong>Bebidas naturales para cafeterias</strong>
                  <b>$85,000 MXN</b>
                </div>
                <p>
                  Comprador: {buyerAccount.displayName} · Proveedor:{" "}
                  {producerAccount.displayName} · Estado: Activo
                </p>
                <p>
                  {shortDemoAddress(buyerAccount.address)} →{" "}
                  {shortDemoAddress(producerAccount.address)}
                </p>
              </div>
              <div className="chain-history">
                <strong>Historial reciente</strong>
                <p>Snacks saludables para OXXO <span>$55,000 MXN</span></p>
                <p>Bebidas naturales para cafeterias <span>$45,000 MXN</span></p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}

function shortDemoAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function LiveOpportunityList({ router }: { router: ReturnType<typeof useRouter> }) {
  const { data: count } = useReadContract({
    address: CONSOLIDATION_POOL_ADDRESS,
    abi: CONSOLIDATION_POOL_ABI,
    functionName: "demandCount",
    query: {
      refetchInterval: 4000,
    },
  });

  if (count === undefined || count === 0n) {
    return (
      <div className="opportunity-list">
        {demoOpportunities.map((opportunity) => (
          <DemoOpportunityCard
            key={opportunity.title}
            opportunity={opportunity}
            onDetails={() => router.navigate({ to: "/app/demand/new" })}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="opportunity-list">
      {[...Array(Number(count))].reverse().map((_, index) => {
        const id = Number(count) - 1 - index;
        return <LiveOpportunityCard id={id} key={`live-opportunity-${id}`} />;
      })}
    </div>
  );
}

function LiveOpportunityCard({ id }: { id: number }) {
  const router = useRouter();
  const { data } = useReadContract({
    address: CONSOLIDATION_POOL_ADDRESS,
    abi: CONSOLIDATION_POOL_ABI,
    functionName: "demands",
    args: [BigInt(id)],
    query: {
      refetchInterval: 4000,
    },
  });
  const { data: commitmentCount } = useReadContract({
    address: CONSOLIDATION_POOL_ADDRESS,
    abi: CONSOLIDATION_POOL_ABI,
    functionName: "getCommitmentCount",
    args: [BigInt(id)],
    query: {
      refetchInterval: 4000,
    },
  });

  if (!data) return null;

  const [
    distributor,
    targetAmount,
    deadline,
    committedAmount,
    title,
    description,
    isActive,
    isConsolidated,
  ] = data as unknown as readonly [
    `0x${string}`,
    bigint,
    bigint,
    bigint,
    string,
    string,
    boolean,
    boolean,
  ];

  if (!shouldShowDemand(id, title)) return null;

  const buyer = findMockAccount(distributor)?.displayName ?? shortDemoAddress(distributor);
  const campaign = findCampaignByTitle(title);
  const progress =
    targetAmount > 0n ? Number((committedAmount * 100n) / targetAmount) : 0;
  const deadlineDate = new Date(Number(deadline) * 1000);
  const remaining = targetAmount > committedAmount ? targetAmount - committedAmount : 0n;
  const opportunity: DemoOpportunity = {
    title,
    buyer,
    location: "On-chain en Monad Testnet",
    deadline: deadlineDate.toLocaleDateString("es-MX"),
    description,
    target: `$${formatMXN(targetAmount)}`,
    committed: `$${formatMXN(committedAmount)} comprometido`,
    remaining:
      remaining > 0n ? `$${formatMXN(remaining)} restante` : "Meta alcanzada",
    progress: Math.min(progress, 100),
    status: isActive && !isConsolidated ? "Activa" : "Cerrada",
    providers: Number(commitmentCount ?? 0n),
    imageUrl: campaign?.imageUrl,
    imageClass: "opportunity-photo-collage",
    action: "details",
  };

  return (
    <DemoOpportunityCard
      opportunity={opportunity}
      onDetails={() =>
        router.navigate({ to: "/app/demand/$id", params: { id: String(id) } })
      }
    />
  );
}

function DemoOpportunityCard({
  opportunity,
  onDetails,
}: {
  opportunity: DemoOpportunity;
  onDetails: () => void;
}) {
  return (
    <article className="opportunity-card" id="offers">
      <div
        className={`opportunity-photo ${opportunity.imageUrl ? "" : opportunity.imageClass}`}
        style={opportunity.imageUrl ? { backgroundImage: `url(${opportunity.imageUrl})` } : undefined}
      >
        <span>{opportunity.status}</span>
      </div>
      <div className="opportunity-body">
        <div className="opportunity-title-row">
          <h3>{opportunity.title}</h3>
          <strong>{opportunity.target}<small>MXN objetivo</small></strong>
        </div>
        <div className="opportunity-meta">
          <span><Star size={14} fill="currentColor" strokeWidth={0} /> {opportunity.buyer}</span>
          <span><MapPin size={14} strokeWidth={2} /> {opportunity.location}</span>
          <span><Calendar size={14} strokeWidth={2} /> Entrega: {opportunity.deadline}</span>
        </div>
        <p>{opportunity.description}</p>
        <div className="opportunity-progress">
          <span style={{ width: `${opportunity.progress}%` }} />
          {opportunity.progress > 0 ? <b>{opportunity.progress}%</b> : null}
        </div>
        <div className="opportunity-footer">
          <span className={opportunity.status === "Proxima" ? "warning-text" : ""}>
            {opportunity.committed}
          </span>
          <span>{opportunity.remaining}</span>
        </div>
        <div className="provider-row">
          {opportunity.providers > 0 ? (
            <>
              <span className="avatar-stack">
                <i />
                <i />
                <i />
                <i />
              </span>
              <small>{opportunity.providers} proveedores unidos</small>
            </>
          ) : (
            <small>Aun sin proveedores unidos</small>
          )}
          <button className="demo-card-button" onClick={onDetails} type="button">
            {opportunity.action === "details" ? "Ver detalles" : "Recordarme"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ActivityList() {
  const items: Array<[ActivityTone, string, string, string]> = [
    ["cart", "Tu oferta fue aceptada", "Bebidas naturales para cafeterias", "Hace 2 horas"],
    ["doc", "Nuevo compromiso registrado", "$85,000 MXN en Bebidas naturales", "Hace 5 horas"],
    ["megaphone", "Nueva oportunidad publicada", "Snacks saludables en OXXO", "Hace 1 dia"],
    ["chat", "Mensaje de Cafe Horizonte", "Interesados en tu oferta", "Hace 2 dias"],
  ];

  return (
    <div className="activity-list">
      {items.map(([tone, title, detail, time]) => (
        <div className="activity-row" key={title}>
          <span className={`activity-icon ${tone}`}>{activityIcon(tone)}</span>
          <div>
            <strong>{title}</strong>
            <small>{detail}</small>
          </div>
          <time>{time}</time>
        </div>
      ))}
    </div>
  );
}

type ActivityTone = "cart" | "doc" | "megaphone" | "chat";

function activityIcon(tone: ActivityTone) {
  if (tone === "cart") return <ShoppingCart size={20} strokeWidth={2} />;
  if (tone === "doc") return <FileText size={20} strokeWidth={2} />;
  if (tone === "megaphone") return <Megaphone size={20} strokeWidth={2} />;
  return <MessageCircle size={20} strokeWidth={2} />;
}

function DemandList({ filter }: { filter: "all" | "active" }) {
  const { data: count } = useReadContract({
    address: CONSOLIDATION_POOL_ADDRESS,
    abi: CONSOLIDATION_POOL_ABI,
    functionName: "demandCount",
    query: {
      refetchInterval: 4000,
    },
  });

  if (count === undefined) {
    return <p className="text-muted">Cargando...</p>;
  }

  if (count === 0n) {
    return <p className="text-muted">No hay demandas todavia.</p>;
  }

  return (
    <div className="demand-grid">
      {[...Array(Number(count))].reverse().map((_, i) => (
        <DemandLoader key={`demand-${i}`} id={i} filter={filter} />
      ))}
    </div>
  );
}

function DemandLoader({ id, filter }: { id: number; filter: string }) {
  const { data } = useReadContract({
    address: CONSOLIDATION_POOL_ADDRESS,
    abi: CONSOLIDATION_POOL_ABI,
    functionName: "demands",
    args: [BigInt(id)],
    query: {
      refetchInterval: 4000,
    },
  });

  if (!data) return null;

  const [
    distributor,
    targetAmount,
    deadline,
    committedAmount,
    title,
    description,
    isActive,
    isConsolidated,
  ] = data as unknown as readonly [
    `0x${string}`,
    bigint,
    bigint,
    bigint,
    string,
    string,
    boolean,
    boolean,
  ];
  const demand: DemandRow = {
    distributor,
    targetAmount,
    deadline,
    committedAmount,
    title,
    description,
    isActive,
    isConsolidated,
  };

  if (filter === "active" && (!demand.isActive || demand.isConsolidated)) return null;

  if (!shouldShowDemand(id, demand.title)) return null;

  const campaign = findCampaignByTitle(demand.title);

  return <DemandCard id={id} demand={demand} imageUrl={campaign?.imageUrl} />;
}

function CreateDemandPage() {
  const guard = useAuthGuard();
  if (guard.status !== "ok") return <Navigate replace to="/" />;

  return (
    <div className="app-layout">
      <Navbar onSettings={() => {}} />
      <div className="app-content">
        <DemandForm />
      </div>
    </div>
  );
}

function DemandDetailPage() {
  const { id } = useParams({ strict: false });
  const demandId = Number(id);
  const guard = useAuthGuard();

  if (guard.status !== "ok") return <Navigate replace to="/" />;

  return (
    <div className="app-layout">
      <Navbar onSettings={() => {}} />
      <div className="app-content">
        <DemandDetailView demandId={demandId} role={guard.role} />
      </div>
    </div>
  );
}

function DemandDetailView({ demandId, role }: { demandId: number; role: Role }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { statusMessage, setStatusMessage } = useDemoStore();
  const { data } = useReadContract({
    address: CONSOLIDATION_POOL_ADDRESS,
    abi: CONSOLIDATION_POOL_ABI,
    functionName: "demands",
    args: [BigInt(demandId)],
    query: {
      refetchInterval: 4000,
    },
  });
  const { data: supplierCommitted } = useReadContract({
    address: CONSOLIDATION_POOL_ADDRESS,
    abi: CONSOLIDATION_POOL_ABI,
    functionName: "supplierCommitted",
    args: [BigInt(demandId), address ?? ZERO_ADDR],
    query: {
      enabled: Boolean(address),
      refetchInterval: 4000,
    },
  });
  const { writeContractAsync, isPending } = useWriteContract();

  if (!data) return <p className="text-muted">Cargando...</p>;

  const [
    distributor,
    targetAmount,
    deadline,
    committedAmount,
    title,
    description,
    isActive,
    isConsolidated,
  ] = data as unknown as readonly [
    `0x${string}`,
    bigint,
    bigint,
    bigint,
    string,
    string,
    boolean,
    boolean,
  ];
  const demand: DemandRow = {
    distributor,
    targetAmount,
    deadline,
    committedAmount,
    title,
    description,
    isActive,
    isConsolidated,
  };
  if (!shouldShowDemand(demandId, demand.title)) {
    return <p className="text-muted">Demanda no encontrada.</p>;
  }
  const deadlineDate = new Date(Number(demand.deadline) * 1000);
  const isDistributor =
    role === "distributor" &&
    Boolean(address) &&
    address?.toLowerCase() === demand.distributor.toLowerCase();
  const isExpired = deadlineDate <= new Date();
  const canWithdraw =
    role === "supplier" &&
    demand.isActive &&
    !demand.isConsolidated &&
    (supplierCommitted ?? 0n) > 0n;
  const canConsolidate =
    isDistributor &&
    demand.isActive &&
    !demand.isConsolidated &&
    demand.committedAmount >= demand.targetAmount;
  const canCancel = isDistributor && demand.isActive && !demand.isConsolidated && isExpired;

  async function submitPoolAction(
    action: "consolidateDemand" | "cancelDemand" | "withdrawCommitment",
  ) {
    if (!publicClient) return;
    const labels = {
      consolidateDemand: "Consolidando demanda",
      cancelDemand: "Cancelando demanda",
      withdrawCommitment: "Retirando compromiso",
    };
    try {
      setStatusMessage({
        tone: "info",
        title: labels[action],
        description: "Confirma la transaccion y espera a que Monad la mine.",
      });
      const hash = await writeContractAsync({
        address: CONSOLIDATION_POOL_ADDRESS,
        abi: CONSOLIDATION_POOL_ABI,
        functionName: action,
        args: [BigInt(demandId)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setStatusMessage({
        tone: "success",
        title: "Estado actualizado",
        description: "La accion ya quedo registrada on-chain.",
      });
    } catch (error) {
      setStatusMessage({
        tone: "error",
        title: "No se pudo ejecutar la accion",
        description:
          error instanceof Error ? error.message : "La wallet rechazo o fallo la transaccion.",
      });
    }
  }

  return (
    <div className="demand-detail">
      <div className="demand-detail-header">
        <h2>{demand.title}</h2>
        {demand.isConsolidated ? (
          <span className="badge badge-success">Consolidado</span>
        ) : !demand.isActive ? (
          <span className="badge badge-muted">Cancelado</span>
        ) : (
          <span className="badge badge-active">Activo</span>
        )}
      </div>
      <p>{demand.description}</p>
      {statusMessage ? (
        <div className={`form-status form-status-${statusMessage.tone}`}>
          <strong>{statusMessage.title}</strong>
          <span>{statusMessage.description}</span>
        </div>
      ) : null}

      <ProgressBar current={demand.committedAmount} target={demand.targetAmount} />

      <div className="demand-detail-stats">
        <div className="stat">
          <span className="stat-label">Objetivo</span>
          <span className="stat-value">${formatMXN(demand.targetAmount)} MXN</span>
        </div>
        <div className="stat">
          <span className="stat-label">Comprometido</span>
          <span className="stat-value">${formatMXN(demand.committedAmount)} MXN</span>
        </div>
        <div className="stat">
          <span className="stat-label">Entrega</span>
          <span className="stat-value">{deadlineDate.toLocaleDateString("es-MX")}</span>
        </div>
      </div>

      <CommitmentList demandId={demandId} />

      {demand.isActive && !demand.isConsolidated && role === "supplier" && (
        <CommitmentForm demandId={demandId} />
      )}

      <div className="action-row">
        {canWithdraw ? (
          <button
            className="btn-ghost"
            disabled={isPending}
            onClick={() => submitPoolAction("withdrawCommitment")}
            type="button"
          >
            Retirar mi compromiso
          </button>
        ) : null}
        {canCancel ? (
          <button
            className="btn-ghost"
            disabled={isPending}
            onClick={() => submitPoolAction("cancelDemand")}
            type="button"
          >
            Cancelar demanda
          </button>
        ) : null}
        {canConsolidate ? (
          <button
            className="btn-primary"
            disabled={isPending}
            onClick={() => submitPoolAction("consolidateDemand")}
            type="button"
          >
            {isPending ? "Consolidando..." : "Consolidar demanda"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SettingsPage() {
  const guard = useAuthGuard();
  if (guard.status !== "ok") return <Navigate replace to="/" />;

  const role = getRole();

  return (
    <div className="app-layout">
      <Navbar onSettings={() => {}} />
      <div className="app-content">
        <div className="settings">
          <h2>Configuracion</h2>
          <div className="setting-row">
            <span>
              Rol actual:{" "}
              <strong>{role === "distributor" ? "Distribuidor" : "Proveedor"}</strong>
            </span>
            <button
              className="btn-ghost"
              onClick={() => {
                clearRole();
                window.location.href = "/";
              }}
              type="button"
            >
              Cambiar rol
            </button>
          </div>
          <ConnectWalletButton />
        </div>
      </div>
    </div>
  );
}

function AdminPage() {
  const { isConnected, address } = useAccount();
  const { statusMessage, setStatusMessage } = useDemoStore();
  const [form, setForm] = useState<MintInput>({
    to: "",
    amountMXN: 100000,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jsonEditor, setJsonEditor] = useState(() => getDbOverridesJson());
  const [jsonError, setJsonError] = useState("");
  const { writeContract, isPending } = useWriteContract();

  if (!isConnected || address?.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
    return <Navigate replace to="/" />;
  }

  function handleMint(e: React.FormEvent) {
    e.preventDefault();
    const result = mintSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    writeContract({
      address: MASA_MXN_ADDRESS,
      abi: MASA_MXN_ABI,
      functionName: "mint",
      args: [form.to as `0x${string}`, parseMXN(form.amountMXN)],
    }, {
      onSuccess: () =>
        setStatusMessage({
          tone: "success",
          title: "Mint enviado",
          description: "La wallet ya recibio la solicitud de mint de mMXN.",
        }),
      onError: (error) =>
        setStatusMessage({
          tone: "error",
          title: "Mint fallido",
          description: error.message,
        }),
    });
  }

  function mintTo(addressToFund: `0x${string}`, amountMXN: number) {
    writeContract(
      {
        address: MASA_MXN_ADDRESS,
        abi: MASA_MXN_ABI,
        functionName: "mint",
        args: [addressToFund, parseMXN(amountMXN)],
      },
      {
        onSuccess: () =>
          setStatusMessage({
            tone: "success",
            title: "Mint enviado",
            description: `Solicitud enviada para fondear ${addressToFund.slice(0, 6)}...${addressToFund.slice(-4)}.`,
          }),
        onError: (error) =>
          setStatusMessage({
            tone: "error",
            title: "Mint fallido",
            description: error.message,
          }),
      },
    );
  }

  return (
    <div className="app-layout">
      <Navbar onSettings={() => {}} />
      <div className="app-content">
        <div className="admin">
          <h2>Admin</h2>
          {statusMessage ? (
            <div className={`form-status form-status-${statusMessage.tone}`}>
              <strong>{statusMessage.title}</strong>
              <span>{statusMessage.description}</span>
            </div>
          ) : null}
          <div className="admin-contracts">
            <p>
              mMXN: <code>{MASA_MXN_ADDRESS}</code>
            </p>
            <p>
              Pool: <code>{CONSOLIDATION_POOL_ADDRESS}</code>
            </p>
          </div>
          <form className="form-stack" onSubmit={handleMint}>
            <h3>Mint mMXN</h3>
            <label className="form-label">
              Direccion destino
              <input
                className="form-input"
                type="text"
                placeholder="0x..."
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
              />
              {errors.to && <span className="form-error">{errors.to}</span>}
            </label>
            <label className="form-label">
              Monto (MXN)
              <input
                className="form-input"
                type="number"
                min="1"
                value={form.amountMXN || ""}
                onChange={(e) =>
                  setForm({ ...form, amountMXN: Number(e.target.value) })
                }
              />
              {errors.amountMXN && (
                <span className="form-error">{errors.amountMXN}</span>
              )}
            </label>
            <button className="btn-primary" disabled={isPending} type="submit">
              {isPending ? "Minteando..." : "Mint mMXN"}
            </button>
          </form>
          <div className="admin-shortcuts">
            <h3>Quick fund</h3>
            <p className="text-muted">
              Mint 100K mMXN to your connected wallet for testing.
            </p>
            <button
              className="btn-primary"
              disabled={isPending}
              onClick={() =>
                writeContract({
                  address: MASA_MXN_ADDRESS,
                  abi: MASA_MXN_ABI,
                  functionName: "mint",
                  args: [address ?? ZERO_ADDR, parseMXN(100000)],
                })
              }
              type="button"
            >
              Mint 100K mMXN to me
            </button>
          </div>
          <div className="admin-shortcuts">
            <h3>Demo accounts</h3>
            <p className="text-muted">
              Fondea las identidades estaticas. Para crear eventos como Alsea o Alma de
              la Selva, cambia a esa wallet y usa el flujo normal; el contrato usa
              <code>msg.sender</code>, asi que admin no puede simular otra cuenta.
            </p>
            <div className="mock-account-list">
              {getMockAccounts().map((account) => (
                <div className="mock-account-row" key={account.address}>
                  <div>
                    <strong>{account.displayName}</strong>
                    <span>{account.verification.label}</span>
                    <code>{account.address}</code>
                  </div>
                  <button
                    className="btn-ghost"
                    disabled={isPending}
                    onClick={() => mintTo(account.address, account.kind === "buyer" ? 500000 : 100000)}
                    type="button"
                  >
                    Mint {account.kind === "buyer" ? "500K" : "100K"} mMXN
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="admin-shortcuts">
            <h3>Runbook de demo on-chain</h3>
            <ol className="demo-runbook">
              <li>Admin: mint 500K mMXN a Alsea y 100K mMXN a Alma de la Selva.</li>
              <li>Alsea: abre Crear demanda, escribe "productos para el refri del starbucks", usa Sugerir y crea la oportunidad.</li>
              <li>Alma de la Selva: abre el detalle de la demanda y registra el compromiso.</li>
              <li>Alsea: cuando la meta este completa, consolida para liberar mMXN a proveedores.</li>
            </ol>
          </div>
          <div className="admin-shortcuts">
            <h3>Mock DB overrides (localStorage)</h3>
            <p className="text-muted">
              Agrega cuentas o campañas que se mergearan con el JSON estatico. Las campañas
              se asocian a demandas on-chain por titulo exacto y pueden llevar imageUrl.
            </p>
            <textarea
              className="json-editor"
              rows={14}
              spellCheck={false}
              value={jsonEditor}
              onChange={(e) => {
                setJsonEditor(e.target.value);
                setJsonError("");
              }}
            />
            {jsonError ? <span className="form-error">{jsonError}</span> : null}
            <div className="json-editor-actions">
              <button
                className="btn-primary"
                type="button"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonEditor);
                    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
                      throw new Error("El JSON debe ser un objeto con accounts y/o campaigns");
                    }
                    saveDbOverrides(parsed);
                    setStatusMessage({
                      tone: "success",
                      title: "Overrides guardados",
                      description: "Recarga la pagina para ver los cambios aplicados.",
                    });
                  } catch (err) {
                    setJsonError(err instanceof Error ? err.message : "JSON invalido");
                  }
                }}
              >
                Guardar overrides
              </button>
              <button
                className="btn-ghost"
                type="button"
                onClick={() => {
                  clearDbOverrides();
                  setJsonEditor(getDbOverridesJson());
                  setStatusMessage({
                    tone: "success",
                    title: "Overrides limpiados",
                    description: "Se eliminaron los datos customizados de localStorage.",
                  });
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: AppPage,
});

const createDemandRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/demand/new",
  component: CreateDemandPage,
});

const demandDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/demand/$id",
  component: DemandDetailPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/settings",
  component: SettingsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  appRoute,
  createDemandRoute,
  demandDetailRoute,
  settingsRoute,
  adminRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
