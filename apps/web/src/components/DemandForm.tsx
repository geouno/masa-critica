import { useState } from "react";
import { useWriteContract } from "wagmi";
import {
  CONSOLIDATION_POOL_ABI,
  CONSOLIDATION_POOL_ADDRESS,
  MASA_MXN_ABI,
  MASA_MXN_ADDRESS,
  parseMXN,
} from "../lib/contracts";
import { type CreateDemandInput, createDemandSchema } from "../lib/schemas";

export function DemandForm() {
  const [form, setForm] = useState<CreateDemandInput>({
    title: "",
    description: "",
    targetAmountMXN: 0,
    deadlineDays: 90,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"form" | "approving" | "creating">("form");

  const { writeContract: writeToken } = useWriteContract();
  const { writeContract: writePool } = useWriteContract();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = createDemandSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    const targetAmount = parseMXN(form.targetAmountMXN);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + form.deadlineDays * 86400);

    setStep("approving");
    writeToken(
      {
        address: MASA_MXN_ADDRESS,
        abi: MASA_MXN_ABI,
        functionName: "approve",
        args: [CONSOLIDATION_POOL_ADDRESS, targetAmount],
      },
      {
        onSuccess: () => {
          setStep("creating");
          writePool(
            {
              address: CONSOLIDATION_POOL_ADDRESS,
              abi: CONSOLIDATION_POOL_ABI,
              functionName: "createDemand",
              args: [form.title, form.description, targetAmount, deadline],
            },
            {
              onSettled: () => setStep("form"),
            },
          );
        },
        onError: () => setStep("form"),
      },
    );
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <h2>Crear campaña</h2>
      <label className="form-label">
        Titulo
        <input
          className="form-input"
          type="text"
          placeholder="Bebidas artesanales para refrigerador"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </label>
      <label className="form-label">
        Descripcion
        <textarea
          className="form-input"
          rows={3}
          placeholder="Buscamos productos artesanales para nuestras tiendas..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </label>
      <label className="form-label">
        Monto objetivo (MXN)
        <input
          className="form-input"
          type="number"
          min="1"
          step="1"
          value={form.targetAmountMXN || ""}
          onChange={(e) =>
            setForm({ ...form, targetAmountMXN: Number(e.target.value) })
          }
        />
        {errors.targetAmountMXN && (
          <span className="form-error">{errors.targetAmountMXN}</span>
        )}
      </label>
      <label className="form-label">
        Plazo (dias)
        <input
          className="form-input"
          type="number"
          min="1"
          max="365"
          value={form.deadlineDays}
          onChange={(e) => setForm({ ...form, deadlineDays: Number(e.target.value) })}
        />
        {errors.deadlineDays && (
          <span className="form-error">{errors.deadlineDays}</span>
        )}
      </label>
      <button className="btn-primary" disabled={step !== "form"} type="submit">
        {step === "approving"
          ? "Aprobando mMXN..."
          : step === "creating"
            ? "Creando campaña..."
            : "Crear campaña"}
      </button>
    </form>
  );
}
