import { useState } from "react";
import { usePublicClient, useWriteContract } from "wagmi";
import {
  CONSOLIDATION_POOL_ABI,
  CONSOLIDATION_POOL_ADDRESS,
  parseMXN,
} from "../lib/contracts";
import { useDemoStore } from "../lib/demoStore";
import { commitToDemandSchema } from "../lib/schemas";

export function CommitmentForm({ demandId }: { demandId: number }) {
  const publicClient = usePublicClient();
  const { commitmentDraft, setCommitmentDraft, statusMessage, setStatusMessage } =
    useDemoStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConfirming, setIsConfirming] = useState(false);

  const { writeContractAsync, isPending } = useWriteContract();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = commitToDemandSchema.safeParse(commitmentDraft);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (!publicClient) {
      setStatusMessage({
        tone: "error",
        title: "RPC no disponible",
        description: "No se pudo preparar el cliente de Monad Testnet.",
      });
      return;
    }

    const form = result.data;
    try {
      setIsConfirming(true);
      setStatusMessage({
        tone: "info",
        title: "Registrando oferta",
        description: "Confirma la transaccion para guardar el compromiso on-chain.",
      });
      const hash = await writeContractAsync({
        address: CONSOLIDATION_POOL_ADDRESS,
        abi: CONSOLIDATION_POOL_ABI,
        functionName: "commitToDemand",
        args: [
          BigInt(demandId),
          parseMXN(form.amountMXN),
          form.productDescription,
          form.deliveryTimeline,
        ],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setStatusMessage({
        tone: "success",
        title: "Oferta registrada",
        description: "El compromiso ya aparece en la lista on-chain.",
      });
    } catch (error) {
      setStatusMessage({
        tone: "error",
        title: "No se registro la oferta",
        description:
          error instanceof Error ? error.message : "La wallet rechazo o fallo la transaccion.",
      });
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <h3>Registrar oferta</h3>
      {statusMessage ? (
        <div className={`form-status form-status-${statusMessage.tone}`}>
          <strong>{statusMessage.title}</strong>
          <span>{statusMessage.description}</span>
        </div>
      ) : null}
      <label className="form-label">
        Monto (MXN)
        <input
          className="form-input"
          type="number"
          min="1"
          step="1"
          value={commitmentDraft.amountMXN || ""}
          onChange={(e) => setCommitmentDraft({ amountMXN: Number(e.target.value) })}
        />
        {errors.amountMXN && <span className="form-error">{errors.amountMXN}</span>}
      </label>
      <label className="form-label">
        Producto
        <input
          className="form-input"
          type="text"
          placeholder="Limonada artesanal de Chiapas"
          value={commitmentDraft.productDescription}
          onChange={(e) => setCommitmentDraft({ productDescription: e.target.value })}
        />
        {errors.productDescription && (
          <span className="form-error">{errors.productDescription}</span>
        )}
      </label>
      <label className="form-label">
        Tiempo de entrega
        <input
          className="form-input"
          type="text"
          placeholder="3 meses"
          value={commitmentDraft.deliveryTimeline}
          onChange={(e) => setCommitmentDraft({ deliveryTimeline: e.target.value })}
        />
        {errors.deliveryTimeline && (
          <span className="form-error">{errors.deliveryTimeline}</span>
        )}
      </label>
      <button className="btn-primary" disabled={isPending || isConfirming} type="submit">
        {isPending || isConfirming ? "Confirmando..." : "Registrar oferta"}
      </button>
    </form>
  );
}
