import { create } from "zustand";

export type DemoDemandDraft = {
  title: string;
  description: string;
  targetAmountMXN: number;
  deadlineDays: number;
};

export type DemoCommitmentDraft = {
  amountMXN: number;
  productDescription: string;
  deliveryTimeline: string;
};

export type DemoStatusMessage = {
  tone: "info" | "success" | "error";
  title: string;
  description: string;
};

type DemoStore = {
  /**
   * The buyer demand draft is shared between the form and the AI suggestion flow.
   * Keeping it in Zustand makes the demo easy to narrate: Alsea types a rough
   * need, the model expands it, and the same state is submitted on-chain.
   */
  demandDraft: DemoDemandDraft;
  /**
   * Supplier offer draft used by Alma de la Selva when committing to a demand.
   * This remains local browser state, but is typed so demo defaults stay coherent.
   */
  commitmentDraft: DemoCommitmentDraft;
  /**
   * User-facing status for wallet actions. It intentionally stores complete
   * sentences so the demo can explain what is pending without reading console logs.
   */
  statusMessage: DemoStatusMessage | null;
  setDemandDraft: (draft: Partial<DemoDemandDraft>) => void;
  setCommitmentDraft: (draft: Partial<DemoCommitmentDraft>) => void;
  setStatusMessage: (message: DemoStatusMessage | null) => void;
};

export const useDemoStore = create<DemoStore>((set) => ({
  demandDraft: {
    title: "",
    description: "",
    targetAmountMXN: 300000,
    deadlineDays: 90,
  },
  commitmentDraft: {
    amountMXN: 85000,
    productDescription: "Limonadas saludables con miel de la selva campechana",
    deliveryTimeline: "Primer lote en 30 dias, abasto recurrente por 3 meses",
  },
  statusMessage: null,
  setDemandDraft: (draft) =>
    set((state) => ({ demandDraft: { ...state.demandDraft, ...draft } })),
  setCommitmentDraft: (draft) =>
    set((state) => ({
      commitmentDraft: { ...state.commitmentDraft, ...draft },
    })),
  setStatusMessage: (message) => set({ statusMessage: message }),
}));
