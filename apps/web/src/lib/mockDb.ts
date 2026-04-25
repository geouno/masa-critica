import type { Address } from "viem";
import type { Role } from "./role";
import mockDb from "./mockDb.json";

export type MockAccountKind = "admin" | "buyer" | "producer";

export type MockVerification = {
  status: "verified" | "unverified";
  label: string;
  verifiedAt?: string;
  verifier?: Address;
};

export type MockAccount = {
  address: Address;
  kind: MockAccountKind;
  role: Role;
  displayName: string;
  legalName?: string;
  initials: string;
  location: string;
  description: string;
  verification: MockVerification;
  tags: string[];
  logoSrc?: string;
};

export const mockAccounts = mockDb.accounts as readonly MockAccount[];

export function findMockAccount(address: Address | string | undefined) {
  if (!address) return undefined;
  return mockAccounts.find(
    (account) => account.address.toLowerCase() === address.toLowerCase(),
  );
}

export function getDemoAccountForRole(role: Role) {
  return (
    mockAccounts.find((account) => account.role === role && account.kind !== "admin") ??
    mockAccounts[0]
  );
}
