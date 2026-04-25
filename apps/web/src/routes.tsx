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
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
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
import { getDisconnectPreference } from "./lib/disconnectPreference";
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

  return (
    <div className="app-layout">
      <Navbar onSettings={() => router.navigate({ to: "/app/settings" })} />
      <div className="app-content">
        {role === "distributor" ? <DistributorDashboard /> : <SupplierDashboard />}
      </div>
    </div>
  );
}

function DistributorDashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Mis demandas</h2>
        <Link className="btn-primary" to="/app/demand/new">
          + Nueva demanda
        </Link>
      </div>
      <DemandList filter="all" />
    </div>
  );
}

function SupplierDashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Demandas activas</h2>
      </div>
      <DemandList filter="active" />
    </div>
  );
}

function DemandList({ filter }: { filter: "all" | "active" }) {
  const { data: count } = useReadContract({
    address: CONSOLIDATION_POOL_ADDRESS,
    abi: CONSOLIDATION_POOL_ABI,
    functionName: "demandCount",
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

  return <DemandCard id={id} demand={demand} />;
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
  const { data } = useReadContract({
    address: CONSOLIDATION_POOL_ADDRESS,
    abi: CONSOLIDATION_POOL_ABI,
    functionName: "demands",
    args: [BigInt(demandId)],
  });
  const { writeContract, isPending } = useWriteContract();

  if (!data) return <p className="text-muted">Cargando...</p>;

  const demand = data as unknown as DemandRow;
  const deadlineDate = new Date(Number(demand.deadline) * 1000);
  const canConsolidate =
    demand.isActive &&
    !demand.isConsolidated &&
    demand.committedAmount >= demand.targetAmount;

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

      {canConsolidate && (
        <button
          className="btn-primary btn-block"
          disabled={isPending}
          onClick={() =>
            writeContract({
              address: CONSOLIDATION_POOL_ADDRESS,
              abi: CONSOLIDATION_POOL_ABI,
              functionName: "consolidateDemand",
              args: [BigInt(demandId)],
            })
          }
          type="button"
        >
          {isPending ? "Consolidando..." : "Consolidar demanda"}
        </button>
      )}
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
  const [form, setForm] = useState<MintInput>({
    to: "",
    amountMXN: 100000,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    });
  }

  return (
    <div className="app-layout">
      <Navbar onSettings={() => {}} />
      <div className="app-content">
        <div className="admin">
          <h2>Admin</h2>
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
