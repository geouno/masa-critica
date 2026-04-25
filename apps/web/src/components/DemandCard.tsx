import { useNavigate } from "@tanstack/react-router";
import type { Address } from "viem";
import { formatMXN } from "../lib/contracts";

export type DemandRow = {
  distributor: Address;
  targetAmount: bigint;
  deadline: bigint;
  committedAmount: bigint;
  title: string;
  description: string;
  isActive: boolean;
  isConsolidated: boolean;
};

export function DemandCard({ id, demand, imageUrl }: { id: number; demand: DemandRow; imageUrl?: string }) {
  const navigate = useNavigate();
  const progress =
    demand.targetAmount > 0n
      ? Number((demand.committedAmount * 100n) / demand.targetAmount)
      : 0;
  const deadlineDate = new Date(Number(demand.deadline) * 1000);
  const isExpired = deadlineDate < new Date();
  const remaining = demand.targetAmount - demand.committedAmount;

  return (
    <a
      className="demand-card"
      href={`/app/demand/${id}`}
      onClick={(e) => {
        e.preventDefault();
        navigate({ to: "/app/demand/$id", params: { id: String(id) } });
      }}
    >
      {imageUrl ? (
        <div className="demand-card-image" style={{ backgroundImage: `url(${imageUrl})` }} />
      ) : null}
      <div className="demand-card-header">
        <span className="demand-card-title">{demand.title}</span>
        {demand.isConsolidated ? (
          <span className="badge badge-success">Consolidado</span>
        ) : !demand.isActive ? (
          <span className="badge badge-muted">Cancelado</span>
        ) : isExpired ? (
          <span className="badge badge-warn">Expirado</span>
        ) : (
          <span className="badge badge-active">Activo</span>
        )}
      </div>
      <p className="demand-card-desc">{demand.description}</p>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="demand-card-footer">
        <span>
          ${formatMXN(demand.committedAmount)} / ${formatMXN(demand.targetAmount)} MXN
        </span>
        <span>
          {remaining > 0n ? `Faltan $${formatMXN(remaining)} MXN` : "Meta alcanzada"}
        </span>
      </div>
      <div className="demand-card-deadline">
        Entrega antes del {deadlineDate.toLocaleDateString("es-MX")}
      </div>
    </a>
  );
}
