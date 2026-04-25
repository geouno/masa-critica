import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { generateDemandSuggestion } from "../lib/aiDemandSuggestions";
import {
  CONSOLIDATION_POOL_ABI,
  CONSOLIDATION_POOL_ADDRESS,
  MASA_MXN_ABI,
  MASA_MXN_ADDRESS,
  parseMXN,
} from "../lib/contracts";
import { useDemoStore } from "../lib/demoStore";
import { findMockAccount, getDemoAccountForRole } from "../lib/mockDb";
import { createDemandSchema } from "../lib/schemas";

export function DemandForm() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { demandDraft, setDemandDraft, statusMessage, setStatusMessage } =
    useDemoStore();
  const [idea, setIdea] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"form" | "suggesting" | "approving" | "creating">(
    "form",
  );

  const { writeContractAsync: writeToken } = useWriteContract();
  const { writeContractAsync: writePool } = useWriteContract();

  async function handleGenerateSuggestion() {
    setErrors({});
    setStep("suggesting");
    setStatusMessage({
      tone: "info",
      title: "Generando sugerencia",
      description: "GLM esta convirtiendo tu idea en una oportunidad lista para demo.",
    });
    try {
      const suggestion = await generateDemandSuggestion({
        roughTitle: idea || demandDraft.title,
        currentDraft: demandDraft,
        buyerName:
          findMockAccount(address)?.displayName ??
          getDemoAccountForRole("distributor").displayName,
      });
      setDemandDraft(suggestion);
      setStatusMessage({
        tone: "success",
        title: "Sugerencia aplicada",
        description: "Revisa el formulario y confirma la transaccion con tu wallet.",
      });
    } catch (error) {
      setStatusMessage({
        tone: "error",
        title: "No se pudo generar la sugerencia",
        description:
          error instanceof Error
            ? error.message
            : "Revisa VITE_ZAI_API_KEY y vuelve a intentarlo.",
      });
    } finally {
      setStep("form");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = createDemandSchema.safeParse(demandDraft);
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
    const targetAmount = parseMXN(form.targetAmountMXN);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + form.deadlineDays * 86400);

    try {
      setStep("approving");
      setStatusMessage({
        tone: "info",
        title: "Aprobando mMXN",
        description: "Confirma el approve y espera a que la transaccion sea minada.",
      });
      const approvalHash = await writeToken({
        address: MASA_MXN_ADDRESS,
        abi: MASA_MXN_ABI,
        functionName: "approve",
        args: [CONSOLIDATION_POOL_ADDRESS, targetAmount],
      });
      await publicClient.waitForTransactionReceipt({ hash: approvalHash });

      setStep("creating");
      setStatusMessage({
        tone: "info",
        title: "Creando oportunidad",
        description: "El contrato esta escrowing el mMXN y publicando la demanda.",
      });
      const createHash = await writePool({
        address: CONSOLIDATION_POOL_ADDRESS,
        abi: CONSOLIDATION_POOL_ABI,
        functionName: "createDemand",
        args: [form.title, form.description, targetAmount, deadline],
      });
      await publicClient.waitForTransactionReceipt({ hash: createHash });

      setStatusMessage({
        tone: "success",
        title: "Oportunidad creada",
        description: "La demanda ya esta en Monad Testnet. Regresando al dashboard.",
      });
      navigate({ to: "/app" });
    } catch (error) {
      setStatusMessage({
        tone: "error",
        title: "Transaccion detenida",
        description:
          error instanceof Error ? error.message : "La wallet rechazo o fallo la transaccion.",
      });
    } finally {
      setStep("form");
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <h2>Crear campaña</h2>
      {statusMessage ? (
        <div className={`form-status form-status-${statusMessage.tone}`}>
          <strong>{statusMessage.title}</strong>
          <span>{statusMessage.description}</span>
        </div>
      ) : null}
      <label className="form-label">
        Idea rapida para AI
        <div className="form-inline">
          <input
            className="form-input"
            type="text"
            placeholder="productos para el refri del starbucks"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />
          <button
            className="btn-ghost"
            disabled={step !== "form"}
            onClick={handleGenerateSuggestion}
            type="button"
          >
            {step === "suggesting" ? "Generando..." : "Sugerir"}
          </button>
        </div>
      </label>
      <label className="form-label">
        Titulo
        <input
          className="form-input"
          type="text"
          placeholder="Bebidas artesanales para refrigerador"
          value={demandDraft.title}
          onChange={(e) => setDemandDraft({ title: e.target.value })}
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </label>
      <label className="form-label">
        Descripcion
        <textarea
          className="form-input"
          rows={3}
          placeholder="Buscamos productos artesanales para nuestras tiendas..."
          value={demandDraft.description}
          onChange={(e) => setDemandDraft({ description: e.target.value })}
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
          value={demandDraft.targetAmountMXN || ""}
          onChange={(e) =>
            setDemandDraft({ targetAmountMXN: Number(e.target.value) })
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
          value={demandDraft.deadlineDays}
          onChange={(e) => setDemandDraft({ deadlineDays: Number(e.target.value) })}
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
            : step === "suggesting"
              ? "Generando sugerencia..."
            : "Crear campaña"}
      </button>
    </form>
  );
}
