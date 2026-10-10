import { createClientFromRequest } from "npm:@base44/sdk@0.8.53";
import { findVendor, listEntries, loggedAt, newYorkDate, sumEntries } from "../../shared/ledger.ts";

const MONTHS: Record<string, number> = { "1m": 1, "3m": 3, "12m": 12 };

// full calendar months before the current one, so a statement never ends mid-month
function periodRange(today: string, months: number) {
  const [year, month] = today.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1 - months, 1));
  const end = new Date(Date.UTC(year, month - 1, 0));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function totalsBy(entries: any[], labelOf: (e: any) => string) {
  const lines = new Map<string, { label: string; amount_cents: number }>();
  for (const e of entries) {
    const label = labelOf(e).trim();
    const key = label.toLowerCase();
    const line = lines.get(key) ?? { label, amount_cents: 0 };
    line.amount_cents += e.amount_cents;
    lines.set(key, line);
  }
  return [...lines.values()].sort((a, b) => b.amount_cents - a.amount_cents);
}

// called by the web page; the vendor's private token is the only key
export default async function (req: Request): Promise<Response> {
  try {
    const { user_token, period } = await req.json();
    const months = MONTHS[period];
    if (!months) {
      return Response.json({ error: "period must be 1m, 3m or 12m" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const vendor = await findVendor(base44, user_token);
    if (!vendor) {
      return Response.json({ error: "vendor not found" }, { status: 404 });
    }

    const today = newYorkDate();
    const { start, end } = periodRange(today, months);
    const all = await listEntries(base44, vendor.id);
    const entries = all
      .filter((e: any) => e.date >= start && e.date <= end)
      .sort((a: any, b: any) => a.date.localeCompare(b.date) || loggedAt(a).localeCompare(loggedAt(b)));

    const firstEntryDate = all.reduce(
      (first: string | null, e: any) => (first === null || e.date < first ? e.date : first),
      null,
    );

    return Response.json({
      vendor: { business_name: vendor.business_name, owner_name: vendor.owner_name ?? null },
      period: { key: period, start, end },
      generated: today,
      first_entry_date: firstEntryDate,
      income: totalsBy(entries.filter((e: any) => e.type === "sale"), (e) => e.item),
      expenses: totalsBy(entries.filter((e: any) => e.type !== "sale"), (e) => e.category || "otros"),
      totals: sumEntries(entries),
      entries: entries.map((e: any) => ({
        id: e.id,
        type: e.type,
        item: e.item,
        category: e.category,
        quantity: e.quantity ?? null,
        amount_cents: e.amount_cents,
        date: e.date,
        logged_at: loggedAt(e),
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
