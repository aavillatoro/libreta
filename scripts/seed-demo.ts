// sample entries for the demo vendor. run once:
//   npx base44 exec --privileged < scripts/seed-demo.ts
const BUSINESS = "Quesadillas Doña Rosa (muestra)";
const FIRST_DAY = "2026-07-01";
const LAST_DAY = "2026-10-09";

const DAYS_OFF = new Set(["2026-07-15", "2026-08-12", "2026-08-27", "2026-09-22"]);
const SLOW_DAYS = new Set(["2026-07-09", "2026-07-23", "2026-08-06", "2026-08-19", "2026-09-10", "2026-09-30"]);

// unit prices in cents
const PRODUCTS = [
  { item: "quesadillas", price: 500, usual: 45 },
  { item: "tamales", price: 300, usual: 35 },
  { item: "aguas frescas", price: 250, usual: 30 },
];

// weekdays: 0 sunday .. 6 saturday; amounts in cents
const PURCHASES = [
  { item: "masa", category: "materiales", weekdays: [2, 4, 6], usual: 8500 },
  { item: "queso", category: "materiales", weekdays: [2, 4, 6], usual: 14000 },
  { item: "aceite", category: "materiales", weekdays: [3, 6], usual: 3800 },
  { item: "bolsas y servilletas", category: "insumos", weekdays: [5], usual: 4800 },
  { item: "gas para el carrito", category: "transporte", weekdays: [3, 0], usual: 5500 },
];

// fixed seed so a rerun on an empty vendor gives the same books
let state = 20261010;
function random(): number {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const between = (low: number, high: number) => low + random() * (high - low);

// new york is utc-4 for the whole range (daylight time ends november 1)
function newYorkTime(date: string, minutesAfterMidnight: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 4, Math.round(minutesAfterMidnight))).toISOString();
}

const [vendor] = await base44.entities.Vendor.filter({ business_name: BUSINESS });
if (!vendor) throw new Error(`vendor not found: ${BUSINESS}`);
const existing = await base44.entities.Entry.filter({ vendor_id: vendor.id }, undefined, 1);
if (existing.length > 0) throw new Error("vendor already has entries; not seeding twice");

const entries: Record<string, unknown>[] = [];
for (let day = new Date(`${FIRST_DAY}T00:00:00Z`); ; day.setUTCDate(day.getUTCDate() + 1)) {
  const date = day.toISOString().slice(0, 10);
  if (date > LAST_DAY) break;
  const weekday = day.getUTCDay();
  // closed on mondays
  if (weekday === 1 || DAYS_OFF.has(date)) continue;

  let morning = between(7 * 60, 8 * 60);
  for (const purchase of PURCHASES) {
    if (!purchase.weekdays.includes(weekday)) continue;
    entries.push({
      vendor_id: vendor.id,
      type: "expense",
      item: purchase.item,
      category: purchase.category,
      amount_cents: Math.round((purchase.usual * between(0.85, 1.15)) / 25) * 25,
      date,
      logged_at: newYorkTime(date, morning),
    });
    morning += between(5, 40);
  }

  const busy = (weekday === 0 || weekday === 6 ? 1.4 : 1) * (SLOW_DAYS.has(date) ? 0.35 : 1);
  let evening = between(18.5 * 60, 20 * 60);
  for (const product of PRODUCTS) {
    const quantity = Math.max(3, Math.round(product.usual * busy * between(0.8, 1.2)));
    entries.push({
      vendor_id: vendor.id,
      type: "sale",
      item: product.item,
      category: "productos",
      quantity,
      amount_cents: quantity * product.price,
      date,
      logged_at: newYorkTime(date, evening),
    });
    evening += between(1, 3);
  }
}

for (let i = 0; i < entries.length; i += 100) {
  await base44.entities.Entry.bulkCreate(entries.slice(i, i + 100));
}

const sales = entries.filter((e) => e.type === "sale").reduce((sum, e) => sum + (e.amount_cents as number), 0);
const expenses = entries.filter((e) => e.type === "expense").reduce((sum, e) => sum + (e.amount_cents as number), 0);
console.log(`seeded ${entries.length} entries: sales ${sales} cents, expenses ${expenses} cents`);
