import type { Address } from "viem";
import type { Role } from "./role";
import staticDb from "./mockDb.json";

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

export type MockCampaign = {
  title: string;
  distributor: Address;
  imageUrl?: string;
  description?: string;
};

export type MockDb = {
  accounts: MockAccount[];
  campaigns: MockCampaign[];
};

const LS_KEY = "mockDbOverrides";

function loadOverrides(): Partial<MockDb> | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Partial<MockDb>) : null;
  } catch {
    return null;
  }
}

export function getMergedDb(): MockDb {
  const overrides = loadOverrides();
  const accounts = [
    ...(staticDb.accounts as readonly MockAccount[]),
    ...(overrides?.accounts ?? []),
  ];
  const campaigns = [
    ...(staticDb.campaigns as readonly MockCampaign[]),
    ...(overrides?.campaigns ?? []),
  ];
  return { accounts, campaigns };
}

export function saveDbOverrides(overrides: Partial<MockDb>): void {
  localStorage.setItem(LS_KEY, JSON.stringify(overrides));
}

export function clearDbOverrides(): void {
  localStorage.removeItem(LS_KEY);
}

export function getDbOverridesJson(): string {
  const overrides = loadOverrides();
  return JSON.stringify(overrides ?? { accounts: [], campaigns: [] }, null, 2);
}

export function getMockAccounts(): readonly MockAccount[] {
  return getMergedDb().accounts;
}

export function getMockCampaigns(): readonly MockCampaign[] {
  return getMergedDb().campaigns;
}

export function findMockAccount(address: Address | string | undefined) {
  if (!address) return undefined;
  return getMockAccounts().find(
    (account) => account.address.toLowerCase() === address.toLowerCase(),
  );
}

export function findCampaignByTitle(title: string): MockCampaign | undefined {
  const t = title.toLowerCase();
  return getMockCampaigns().find((c) => c.title.toLowerCase() === t);
}

export function getDemoAccountForRole(role: Role) {
  return (
    getMockAccounts().find((account) => account.role === role && account.kind !== "admin") ??
    getMockAccounts()[0]
  );
}

export const mockAccounts = staticDb.accounts as readonly MockAccount[];
