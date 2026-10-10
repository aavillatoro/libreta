import { secrets } from "base44:runtime";

// vendors are in new york; the server clock is utc
export function newYorkDate(when?: string): string {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
  if (when !== "yesterday") return today;
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function toCents(dollars: unknown): number {
  return Math.round(Number(dollars) * 100);
}

export function formatDollars(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}

export function hasMoniSecret(req: Request): boolean {
  const secret = secrets.get("MONI_SECRET");
  return Boolean(secret) && req.headers.get("x-moni-secret") === secret;
}

export async function findVendor(base44: any, token: unknown) {
  if (!token || typeof token !== "string") return null;
  const vendors = await base44.asServiceRole.entities.Vendor.filter({ token }, undefined, 1);
  return vendors[0] ?? null;
}

export async function listEntries(base44: any, vendorId: string, extra: Record<string, unknown> = {}) {
  return await base44.asServiceRole.entities.Entry.filter({ vendor_id: vendorId, ...extra }, "-created_date", 5000);
}

// seeded sample entries carry their own time; base44's created_date is utc without a zone suffix
export function loggedAt(entry: any): string {
  const at = entry.logged_at ?? entry.created_date;
  return /Z|[+-]\d\d:?\d\d$/.test(at) ? at : `${at}Z`;
}

export function sumEntries(entries: any[]) {
  let sales = 0;
  let expenses = 0;
  for (const e of entries) {
    if (e.type === "sale") sales += e.amount_cents;
    else expenses += e.amount_cents;
  }
  return { sales_cents: sales, expenses_cents: expenses, profit_cents: sales - expenses };
}
