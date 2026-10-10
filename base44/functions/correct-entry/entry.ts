import { createClientFromRequest } from "npm:@base44/sdk@0.8.53";
import { findVendor, formatDollars, hasMoniSecret, listEntries, toCents } from "../../shared/ledger.ts";

// so "champurrado" finds "Champurrádo"
function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

function given(value: unknown): boolean {
  return value != null && value !== "";
}

export default async function (req: Request): Promise<Response> {
  try {
    if (!hasMoniSecret(req)) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const { user_token, item, new_amount, new_unit_price, new_quantity, new_item } = await req.json();

    if (!item || typeof item !== "string") {
      return Response.json({ error: "item is required" }, { status: 400 });
    }
    if (!given(new_amount) && !given(new_unit_price) && !given(new_quantity) && !given(new_item)) {
      return Response.json(
        { error: "send new_amount, new_unit_price, new_quantity or new_item" },
        { status: 400 },
      );
    }

    const base44 = createClientFromRequest(req);
    const vendor = await findVendor(base44, user_token);
    if (!vendor) {
      return Response.json({ error: "vendor not found" }, { status: 404 });
    }

    // newest first, so the vendor corrects what they just said
    const wanted = normalize(item);
    const entries = await listEntries(base44, vendor.id);
    const entry = entries.find((e: any) => {
      const have = normalize(e.item);
      return have.includes(wanted) || wanted.includes(have);
    });
    if (!entry) {
      return Response.json({ ok: false, message: `No encontré ninguna entrada de ${item}.` });
    }

    const qty = given(new_quantity) ? Number(new_quantity) : entry.quantity ?? null;
    if (given(new_quantity) && !(qty > 0)) {
      return Response.json({ error: "new_quantity must be a positive number" }, { status: 400 });
    }

    let amountCents = entry.amount_cents;
    if (given(new_amount)) {
      amountCents = toCents(new_amount);
    } else if (given(new_unit_price)) {
      amountCents = Math.round(toCents(new_unit_price) * (qty ?? 1));
    } else if (given(new_quantity) && entry.quantity > 0) {
      // same unit price, different count
      amountCents = Math.round((entry.amount_cents / entry.quantity) * qty);
    }
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return Response.json({ error: "amount must be a positive number" }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.Entry.update(entry.id, {
      item: given(new_item) ? String(new_item).trim() : entry.item,
      ...(qty !== null ? { quantity: qty } : {}),
      amount_cents: amountCents,
    });

    return Response.json({
      ok: true,
      entry_id: entry.id,
      item: updated.item,
      quantity: updated.quantity ?? null,
      amount_cents: amountCents,
      previous_amount_cents: entry.amount_cents,
      message: `Corregido: ${updated.item}, ${formatDollars(amountCents)}.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
