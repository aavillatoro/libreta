import { dateLabel, entryTime, money } from '@/lib/ledger';

function Row({ entry, fresh }) {
  const sale = entry.type === 'sale';
  return (
    <li className={`relative flex items-stretch border-b border-rule last:border-b-0 ${fresh ? 'row-fresh' : ''}`}>
      <span className="w-20 shrink-0 flex items-center justify-center font-mono text-sm text-soft border-r-2 border-margin">
        {entryTime(entry.created_date)}
      </span>
      <div className="flex-1 min-w-0 px-3 py-4">
        <p className="text-lg font-bold leading-tight first-letter:uppercase">
          {entry.item}
          {entry.quantity ? ` ×${entry.quantity}` : ''}
        </p>
        <p className="mt-1.5 flex flex-wrap gap-1.5 text-xs font-bold uppercase tracking-wide">
          <span className={`rounded-full px-2 py-0.5 ${sale ? 'bg-sale/10 text-sale' : 'bg-expense/10 text-expense'}`}>
            {sale ? 'Venta' : 'Gasto'}
          </span>
          {!sale && entry.category && (
            <span className="rounded-full px-2 py-0.5 border border-line text-soft">{entry.category}</span>
          )}
        </p>
      </div>
      <span className={`flex items-center pr-4 text-xl font-bold whitespace-nowrap ${sale ? 'text-sale' : 'text-expense'}`}>
        {sale ? '+' : '−'}
        {money(entry.amount_cents)}
      </span>
      {fresh && <span className="anotado">Anotado</span>}
    </li>
  );
}

function Page({ entries, freshIds, empty }) {
  return (
    <ul className="bg-card border-2 border-line rounded-2xl overflow-hidden">
      {entries.length === 0 && <li className="px-5 py-6 text-soft">{empty}</li>}
      {entries.map((entry) => (
        <Row key={entry.id} entry={entry} fresh={freshIds.has(entry.id)} />
      ))}
    </ul>
  );
}

const byDate = (entries) => {
  const days = new Map();
  for (const entry of entries) {
    if (!days.has(entry.date)) days.set(entry.date, []);
    days.get(entry.date).push(entry);
  }
  return days;
};

export function TodayLedger({ today, entries, freshIds }) {
  const todays = entries.filter((e) => e.date === today);
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-serif font-semibold text-3xl">Mi libreta</h2>
        <span className="text-soft">
          {todays.length} {todays.length === 1 ? 'registro' : 'registros'} hoy
        </span>
      </div>
      <Page entries={todays} freshIds={freshIds} empty="Todavía no hay registros hoy." />
    </section>
  );
}

export function EarlierLedger({ today, entries, freshIds }) {
  const days = [...byDate(entries.filter((e) => e.date !== today))];
  if (days.length === 0) return null;
  return (
    <section className="space-y-5">
      <h2 className="font-serif font-semibold text-2xl">Días anteriores</h2>
      {days.map(([date, list]) => (
        <div key={date}>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-soft">{dateLabel(date)}</h3>
          <Page entries={list} freshIds={freshIds} />
        </div>
      ))}
    </section>
  );
}
