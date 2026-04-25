import { useState } from "react";
import { useWriteContract } from "wagmi";
import {
  CONSOLIDATION_POOL_ABI,
  CONSOLIDATION_POOL_ADDRESS,
  parseMXN,
} from "../lib/contracts";
import { type CommitToDemandInput, commitToDemandSchema } from "../lib/schemas";

export function CommitmentForm({ demandId }: { demandId: number }) {
  const [form, setForm] = useState<CommitToDemandInput>({
    amountMXN: 0,
    productDescription: "",
    deliveryTimeline: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { writeContract, isPending } = useWriteContract();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = commitToDemandSchema.safeParse(form);
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
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <h3>Registrar oferta</h3>
      <label className="form-label">
        Monto (MXN)
        <input
          className="form-input"
          type="number"
          min="1"
          step="1"
          value={form.amountMXN || ""}
          onChange={(e) => setForm({ ...form, amountMXN: Number(e.target.value) })}
        />
        {errors.amountMXN && <span className="form-error">{errors.amountMXN}</span>}
      </label>
      <label className="form-label">
        Producto
        <input
          className="form-input"
          type="text"
          placeholder="Limonada artesanal de Chiapas"
          value={form.productDescription}
          onChange={(e) => setForm({ ...form, productDescription: e.target.value })}
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
          value={form.deliveryTimeline}
          onChange={(e) => setForm({ ...form, deliveryTimeline: e.target.value })}
        />
        {errors.deliveryTimeline && (
          <span className="form-error">{errors.deliveryTimeline}</span>
        )}
      </label>
      <button className="btn-primary" disabled={isPending} type="submit">
        {isPending ? "Confirmando..." : "Registrar oferta"}
      </button>
    </form>
  );
}
