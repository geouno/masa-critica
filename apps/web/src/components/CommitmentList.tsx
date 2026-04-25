import type { Address } from "viem";
import { useReadContract } from "wagmi";
import {
  CONSOLIDATION_POOL_ABI,
  CONSOLIDATION_POOL_ADDRESS,
  formatMXN,
} from "../lib/contracts";

export function CommitmentList({ demandId }: { demandId: number }) {
  const { data: count } = useReadContract({
    address: CONSOLIDATION_POOL_ADDRESS,
    abi: CONSOLIDATION_POOL_ABI,
    functionName: "getCommitmentCount",
    args: [BigInt(demandId)],
    query: {
      refetchInterval: 4000,
    },
  });

  if (!count || count === 0n) {
    return <p className="text-muted">Aun no hay ofertas registradas.</p>;
  }

  return (
    <div className="commitment-list">
      <h3>Ofertas ({count.toString()})</h3>
      {[...Array(Number(count))].map((_, i) => (
        <CommitmentRow
          key={`commitment-${demandId}-${i}`}
          demandId={demandId}
          index={i}
        />
      ))}
    </div>
  );
}

function CommitmentRow({ demandId, index }: { demandId: number; index: number }) {
  const { data } = useReadContract({
    address: CONSOLIDATION_POOL_ADDRESS,
    abi: CONSOLIDATION_POOL_ABI,
    functionName: "getCommitment",
    args: [BigInt(demandId), BigInt(index)],
    query: {
      refetchInterval: 4000,
    },
  });

  if (!data) return null;

  const [supplier, amount, productDescription, deliveryTimeline] = data as [
    Address,
    bigint,
    string,
    string,
  ];

  return (
    <div className="commitment-row">
      <div className="commitment-header">
        <span className="commitment-supplier">
          {supplier.slice(0, 6)}...{supplier.slice(-4)}
        </span>
        <span className="commitment-amount">${formatMXN(amount)} MXN</span>
      </div>
      <div className="commitment-details">
        <span>{productDescription}</span>
        <span className="text-muted">Entrega: {deliveryTimeline}</span>
      </div>
    </div>
  );
}
