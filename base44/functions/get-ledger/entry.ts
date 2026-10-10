import { createClientFromRequest } from "npm:@base44/sdk@0.8.53";
import { findVendor, listEntries, loggedAt, newYorkDate, sumEntries } from "../../shared/ledger.ts";

// called by the web page; the vendor's private token is the only key
export default async function (req: Request): Promise<Response> {
  try {
    const { user_token } = await req.json();
    const base44 = createClientFromRequest(req);
    const vendor = await findVendor(base44, user_token);
    if (!vendor) {
      return Response.json({ error: "vendor not found" }, { status: 404 });
    }

    const today = newYorkDate();
    const all = await listEntries(base44, vendor.id);
    // newest day first, newest entry first within a day
    all.sort((a: any, b: any) => b.date.localeCompare(a.date) || loggedAt(b).localeCompare(loggedAt(a)));

    return Response.json({
      vendor: { business_name: vendor.business_name, owner_name: vendor.owner_name ?? null },
      today,
      totals: {
        today: sumEntries(all.filter((e: any) => e.date === today)),
        all_time: sumEntries(all),
      },
      entries: all.map((e: any) => ({
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
