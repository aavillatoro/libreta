import { createClientFromRequest } from "npm:@base44/sdk@0.8.53";
import { findVendor, formatDollars, hasMoniSecret, newYorkDate, toCents } from "../../shared/ledger.ts";

export default async function (req: Request): Promise<Response> {
  try {
    if (!hasMoniSecret(req)) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { user_token, type, item, category, quantity, unit_price, amount, date } = body;

    if (!user_token) {
      return Response.json({ error: "user_token is required" }, { status: 400 });
    }
    if (type !== "sale" && type !== "expense") {
      return Response.json({ error: "type must be sale or expense" }, { status: 400 });
    }
    if (!item || typeof item !== "string") {
      return Response.json({ error: "item is required" }, { status: 400 });
    }

    const qty = quantity == null || quantity === "" ? null : Number(quantity);
    if (qty !== null && !(qty > 0)) {
      return Response.json({ error: "quantity must be a positive number" }, { status: 400 });
    }

    // moni sends dollars as spoken; an explicit total wins over unit_price x quantity
    let amountCents: number;
    if (amount != null && amount !== "") {
      amountCents = toCents(amount);
    } else if (unit_price != null && unit_price !== "") {
      amountCents = Math.round(toCents(unit_price) * (qty ?? 1));
    } else {
      return Response.json({ error: "amount or unit_price is required" }, { status: 400 });
    }
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return Response.json({ error: "amount must be a positive number" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const vendor = await findVendor(base44, user_token);
    if (!vendor) {
      return Response.json({ error: "vendor not found" }, { status: 404 });
    }

    const entry = await base44.asServiceRole.entities.Entry.create({
      vendor_id: vendor.id,
      type,
      item: item.trim(),
      category: category ? String(category).trim() : "otros",
      ...(qty !== null ? { quantity: qty } : {}),
      amount_cents: amountCents,
      date: newYorkDate(date),
    });

    const label = type === "sale" ? "venta" : "gasto";
    return Response.json({
      ok: true,
      entry_id: entry.id,
      amount_cents: amountCents,
      date: entry.date,
      message: `Anotado: ${label} de ${entry.item}, ${formatDollars(amountCents)}.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
