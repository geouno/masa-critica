import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { DemoDemandDraft } from "./demoStore";

type SuggestionInput = {
  roughTitle: string;
  currentDraft: DemoDemandDraft;
  buyerName: string;
};

export async function generateDemandSuggestion({
  roughTitle,
  currentDraft,
  buyerName,
}: SuggestionInput): Promise<DemoDemandDraft> {
  const apiKey = import.meta.env.VITE_ZAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_ZAI_API_KEY");
  }

  const zai = createOpenAI({
    apiKey,
    baseURL: "https://api.z.ai/api/paas/v4",
  });

  const result = await generateText({
    model: zai.chat("glm-5.1"),
    prompt: [
      `Eres un asistente para Masa Critica, una plataforma B2B mexicana.`,
      `El comprador verificado es ${buyerName}.`,
      `Convierte esta idea en una oportunidad concreta para pequenos productores: "${roughTitle}".`,
      `Estado actual del formulario: ${JSON.stringify(currentDraft)}.`,
      "Devuelve SOLO un JSON valido sin markdown ni backticks con esta estructura exacta:",
      '{"title":"...","description":"...","targetAmountMXN":300000,"deadlineDays":90}',
      "El titulo debe ser breve, la descripcion operacional en espanol, monto objetivo en MXN y plazo en dias.",
      "El ejemplo debe sonar listo para una demo: productos de refrigerador, empaque, entrega, calidad y volumen.",
    ].join("\n"),
  });

  const text = result.text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("La respuesta no contiene JSON valido.");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (
    typeof parsed.title !== "string" ||
    typeof parsed.description !== "string" ||
    typeof parsed.targetAmountMXN !== "number" ||
    typeof parsed.deadlineDays !== "number"
  ) {
    throw new Error("La respuesta no tiene la estructura esperada.");
  }

  return {
    title: parsed.title,
    description: parsed.description,
    targetAmountMXN: parsed.targetAmountMXN,
    deadlineDays: parsed.deadlineDays,
  };
}
