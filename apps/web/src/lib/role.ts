export type Role = "distributor" | "supplier";

const ROLE_KEY = "masa-critica.role";

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ROLE_KEY);
  if (raw === "distributor" || raw === "supplier") return raw;
  return null;
}

export function setRole(role: Role): void {
  window.localStorage.setItem(ROLE_KEY, role);
}

export function clearRole(): void {
  window.localStorage.removeItem(ROLE_KEY);
}
