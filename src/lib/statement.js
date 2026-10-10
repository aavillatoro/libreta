const CATEGORIES = {
  productos: 'Products',
  servicios: 'Services',
  materiales: 'Materials and ingredients',
  insumos: 'Supplies',
  transporte: 'Transportation',
  renta: 'Rent',
  equipo: 'Equipment',
  otros: 'Other',
  // names moni used before the current list
  ingredientes: 'Materials and ingredients',
  comida: 'Products',
  bebidas: 'Products',
};

export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const categoryLabel = (category) => CATEGORIES[category?.toLowerCase()] ?? capitalize(category ?? 'Other');

// two spanish categories can share an english name; show them as one line
export function byCategoryLabel(lines) {
  const merged = new Map();
  for (const line of lines) {
    const label = categoryLabel(line.label);
    merged.set(label, (merged.get(label) ?? 0) + line.amount_cents);
  }
  return [...merged].map(([label, amount_cents]) => ({ label, amount_cents })).sort((a, b) => b.amount_cents - a.amount_cents);
}

const parts = (date) => {
  const [year, month, day] = date.split('-').map(Number);
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
  return { year, month, day, monthName };
};

// "2026-07-01" -> "July 1, 2026"
export function longDate(date) {
  const { year, day, monthName } = parts(date);
  return `${monthName} ${day}, ${year}`;
}

// "2026-07-01" -> "Jul 1"
export function shortDate(date) {
  const { day, monthName } = parts(date);
  return `${monthName.slice(0, 3)} ${day}`;
}

export function periodLabel({ start, end }) {
  const a = parts(start);
  const b = parts(end);
  if (a.year === b.year && a.month === b.month) return `${a.monthName} ${a.day}–${b.day}, ${a.year}`;
  if (a.year === b.year) return `${a.monthName} ${a.day} – ${b.monthName} ${b.day}, ${a.year}`;
  return `${longDate(start)} – ${longDate(end)}`;
}

// "2026-10-10" -> "noviembre"
export function nextMonthName(date) {
  const [year, month] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('es', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month, 1)));
}
