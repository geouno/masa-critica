const LS_KEY = "demoSeenAt";

const seenAtMap = new Map<number, number>();

function loadSeenAt() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, number>;
      for (const [k, v] of Object.entries(parsed)) {
        seenAtMap.set(Number(k), v);
      }
    }
  } catch {
    // ignore
  }
}

loadSeenAt();

function persistSeenAt() {
  const obj: Record<string, number> = {};
  for (const [k, v] of seenAtMap) {
    obj[k] = v;
  }
  localStorage.setItem(LS_KEY, JSON.stringify(obj));
}

function recordSeen(id: number) {
  if (!seenAtMap.has(id)) {
    seenAtMap.set(id, Date.now());
    persistSeenAt();
  }
}

function isFunny() {
  return Boolean(import.meta.env.VITE_FUNNY);
}

function maxAgeMs(): number {
  const raw = import.meta.env.VITE_DEMO_MAX_AGE_MINUTES;
  const minutes = raw ? Number(raw) : 8;
  return (Number.isFinite(minutes) && minutes > 0 ? minutes : 8) * 60_000;
}

export function shouldShowDemand(id: number, title: string): boolean {
  if (isFunny()) return true;

  const t = title.toLowerCase();
  if (t.startsWith("salsa")) return false;

  recordSeen(id);

  if (t.includes("test")) {
    const seenAt = seenAtMap.get(id);
    if (seenAt != null && Date.now() - seenAt > maxAgeMs()) return false;
  }

  return true;
}
