import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  Outlet,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { Header } from "./components/Header";
import { getDisconnectPreference } from "./lib/disconnectPreference";

type Campaign = {
  id: string;
  title: string;
  buyer: string;
  targetMxn: number;
  committedMxn: number;
  deadline: string;
  deliveryWindow: string;
  requirements: string[];
  lots: string[];
};

const seededCampaigns: Campaign[] = [
  {
    id: "fridge-ready",
    title: "Productos refrigerados listos para anaquel",
    buyer: "Cadena nacional de cafeterias",
    targetMxn: 300000,
    committedMxn: 184000,
    deadline: "21 dias para comprometer",
    deliveryWindow: "Entrega consolidada en 90 dias",
    requirements: ["Empaque individual", "Factura", "Etiqueta nutrimental"],
    lots: ["Limonada con miel", "Helado artesanal", "Yogurt con fruta local"],
  },
  {
    id: "premium-snacks",
    title: "Snacks premium para tiendas corporativas",
    buyer: "Distribuidor food service Bajio",
    targetMxn: 180000,
    committedMxn: 96000,
    deadline: "14 dias para comprometer",
    deliveryWindow: "2 lotes mensuales",
    requirements: ["Vida de anaquel 45 dias", "Caja master", "Codigo de barras"],
    lots: ["Granola", "Cafe cold brew", "Barras de amaranto"],
  },
];

function formatMxn(value: number) {
  return new Intl.NumberFormat("es-MX", {
    currency: "MXN",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function RootLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Oferta local, escala institucional</p>
          <h1>Masa Critica</h1>
          <p className="hero-lede">
            Consolidamos capacidad productiva de pequenos proveedores hasta convertirla
            en una compra viable para cadenas, distribuidores y compradores grandes.
          </p>
          <div className="hero-metrics">
            <span>
              <strong>{formatMxn(300000)}</strong>
              objetivo comprador
            </span>
            <span>
              <strong>8</strong>
              proveedores alineados
            </span>
            <span>
              <strong>90 dias</strong>
              ventana de entrega
            </span>
          </div>
        </div>
        <div className="hero-panel">
          <p className="panel-label">Convocatoria activa</p>
          <h2>Productos refrigerados para anaquel</h2>
          <div className="progress-track">
            <span style={{ width: "61%" }} />
          </div>
          <p className="progress-copy">
            {formatMxn(184000)} comprometidos de {formatMxn(300000)}
          </p>
        </div>
      </section>

      <section className="campaign-strip" aria-label="Example campaigns">
        {seededCampaigns.map((campaign) => (
          <article className="campaign-card" key={campaign.id}>
            <p>{campaign.buyer}</p>
            <h2>{campaign.title}</h2>
            <span>{campaign.deliveryWindow}</span>
          </article>
        ))}
      </section>

      <section className="thesis" id="thesis">
        <p className="eyebrow">Tesis</p>
        <h2>El problema no es solo producir. Es llegar al volumen minimo.</h2>
        <p>
          Las tiendas de abarrotes tienen distribucion porque Coca-Cola, Bimbo y
          Sabritas ya resolvieron la ruta. Pero miles de productores no tienen una red
          asi. Masa Critica junta lotes pequenos, registra compromisos con wallets y
          crea una oferta suficientemente grande para iniciar una negociacion
          institucional.
        </p>
      </section>
    </div>
  );
}

function AppPage() {
  const { isConnected, isReconnecting } = useAccount();

  if (isReconnecting && !getDisconnectPreference()) {
    return <div className="app-shell">Checking wallet...</div>;
  }

  if (!isConnected || getDisconnectPreference()) {
    return <Navigate replace to="/" />;
  }

  return <MasaDashboard />;
}

function MasaDashboard() {
  const [campaigns, setCampaigns] = useState(seededCampaigns);
  const [selectedId, setSelectedId] = useState(seededCampaigns[0].id);
  const [commitment, setCommitment] = useState({
    product: "Limonada con miel de Chiapas",
    value: 45000,
    window: "Lista para entregar en 8 semanas",
  });

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedId) ?? campaigns[0],
    [campaigns, selectedId],
  );
  const progress = Math.min(
    100,
    Math.round((selectedCampaign.committedMxn / selectedCampaign.targetMxn) * 100),
  );

  function submitCommitment() {
    setCampaigns((currentCampaigns) =>
      currentCampaigns.map((campaign) =>
        campaign.id === selectedCampaign.id
          ? {
              ...campaign,
              committedMxn: campaign.committedMxn + commitment.value,
              lots: [commitment.product, ...campaign.lots],
            }
          : campaign,
      ),
    );
  }

  return (
    <div className="app-page">
      <section className="dashboard-intro">
        <div>
          <p className="eyebrow">Dashboard proveedor</p>
          <h1>Unete a una convocatoria y suma volumen verificable.</h1>
        </div>
        <div className="status-pill">
          {progress >= 100 ? "Masa critica alcanzada" : `${progress}% consolidado`}
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="campaign-list">
          {campaigns.map((campaign) => (
            <button
              className={
                campaign.id === selectedCampaign.id
                  ? "campaign-selector selected"
                  : "campaign-selector"
              }
              key={campaign.id}
              onClick={() => setSelectedId(campaign.id)}
              type="button"
            >
              <span>{campaign.buyer}</span>
              <strong>{campaign.title}</strong>
              <small>
                {formatMxn(campaign.committedMxn)} / {formatMxn(campaign.targetMxn)}
              </small>
            </button>
          ))}
        </div>

        <article className="campaign-detail">
          <p className="panel-label">{selectedCampaign.deadline}</p>
          <h2>{selectedCampaign.title}</h2>
          <div className="progress-track large">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-copy">
            {formatMxn(selectedCampaign.committedMxn)} comprometidos de{" "}
            {formatMxn(selectedCampaign.targetMxn)}
          </p>
          <div className="requirements">
            {selectedCampaign.requirements.map((requirement) => (
              <span key={requirement}>{requirement}</span>
            ))}
          </div>
          <ul className="lot-list">
            {selectedCampaign.lots.map((lot) => (
              <li key={lot}>{lot}</li>
            ))}
          </ul>
        </article>

        <form
          className="commitment-form"
          onSubmit={(event) => {
            event.preventDefault();
            submitCommitment();
          }}
        >
          <p className="panel-label">Nueva oferta</p>
          <label>
            Producto
            <input
              onChange={(event) =>
                setCommitment({ ...commitment, product: event.target.value })
              }
              value={commitment.product}
            />
          </label>
          <label>
            Valor comprometido MXN
            <input
              min="1000"
              onChange={(event) =>
                setCommitment({
                  ...commitment,
                  value: Number(event.target.value),
                })
              }
              type="number"
              value={commitment.value}
            />
          </label>
          <label>
            Ventana de entrega
            <input
              onChange={(event) =>
                setCommitment({ ...commitment, window: event.target.value })
              }
              value={commitment.window}
            />
          </label>
          <button type="submit">Commit supply</button>
          <p className="form-note">
            Demo local: el siguiente paso sera emitir este compromiso como evento en
            Monad.
          </p>
        </form>
      </section>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

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

const routeTree = rootRoute.addChildren([indexRoute, appRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
