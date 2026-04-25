import { z } from "zod";

export const createDemandSchema = z.object({
  title: z.string().min(3, "Minimo 3 caracteres"),
  description: z.string().min(10, "Minimo 10 caracteres"),
  targetAmountMXN: z.coerce.number().positive("Debe ser mayor a 0"),
  deadlineDays: z.coerce
    .number()
    .int()
    .min(1, "Minimo 1 dia")
    .max(365, "Maximo 365 dias"),
});

export type CreateDemandInput = z.infer<typeof createDemandSchema>;

export const commitToDemandSchema = z.object({
  amountMXN: z.coerce.number().positive("Debe ser mayor a 0"),
  productDescription: z.string().min(3, "Minimo 3 caracteres"),
  deliveryTimeline: z.string().min(3, "Minimo 3 caracteres"),
});

export type CommitToDemandInput = z.infer<typeof commitToDemandSchema>;

export const mintSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Direccion invalida"),
  amountMXN: z.coerce.number().positive("Debe ser mayor a 0"),
});

export type MintInput = z.infer<typeof mintSchema>;
