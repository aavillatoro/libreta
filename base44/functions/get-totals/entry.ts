import { createClientFromRequest } from "npm:@base44/sdk@0.8.53";
import { findVendor, formatDollars, hasMoniSecret, listEntries, newYorkDate, sumEntries } from "../../shared/ledger.ts";

export default async function (req: Request): Promise<Response> {
  try {
    if (!hasMoniSecret(req)) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const { user_token } = await req.json();
    const base44 = createClientFromRequest(req);
    const vendor = await findVendor(base44, user_token);
    if (!vendor) {
      return Response.json({ error: "vendor not found" }, { status: 404 });
    }

    const date = newYorkDate();
    const entries = await listEntries(base44, vendor.id, { date });
    const totals = sumEntries(entries);

    return Response.json({
      ok: true,
      date,
      entry_count: entries.length,
      ...totals,
      message:
        `Hoy: ventas ${formatDollars(totals.sales_cents)}, ` +
        `gastos ${formatDollars(totals.expenses_cents)}, ` +
        `ganancia ${formatDollars(totals.profit_cents)}.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
