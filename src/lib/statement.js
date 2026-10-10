const CATEGORIES = {
  productos: 'Products',
  materiales: 'Materials and ingredients',
  insumos: 'Supplies',
  transporte: 'Transportation',
  otros: 'Other',
};

export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const categoryLabel = (category) => CATEGORIES[category?.toLowerCase()] ?? capitalize(category ?? 'Other');

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
