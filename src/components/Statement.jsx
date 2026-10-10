import { useEffect, useState } from 'react';
import { CalendarDays, Check, ChevronLeft, Download, Home, Landmark } from 'lucide-react';
import { entryTime, fetchStatement, money } from '@/lib/ledger';
import { byCategoryLabel, capitalize, categoryLabel, longDate, nextMonthName, periodLabel, shortDate } from '@/lib/statement';

const PURPOSES = [
  { period: '1m', title: 'Un préstamo', range: 'Último mes', Icon: Landmark },
  { period: '3m', title: 'Beneficios o vivienda', range: 'Últimos 3 meses', Icon: Home },
  { period: '12m', title: 'Impuestos', range: 'Últimos 12 meses', Icon: CalendarDays },
];

function Lines({ heading, lines, total, totalLabel }) {
  return (
    <>
      <h3 className="mt-5 pb-1 text-sm font-bold uppercase tracking-widest border-b-2 border-ink">{heading}</h3>
      {lines.map((line) => (
        <div key={line.label} className="flex justify-between gap-3 py-1.5">
          <span>{line.label}</span>
          <span>{money(line.amount_cents)}</span>
        </div>
      ))}
      <div className="flex justify-between gap-3 py-1.5 font-bold border-t border-line">
        <span>{totalLabel}</span>
        <span>{money(total)}</span>
      </div>
    </>
  );
}

function Summary({ statement }) {
  const { vendor, period, totals, first_entry_date: firstEntry } = statement;
  const income = statement.income.map((line) => ({ ...line, label: capitalize(line.label) }));
  const expenses = byCategoryLabel(statement.expenses);
  return (
    <article className="sheet">
      <h2 className="font-serif font-semibold text-2xl">Profit and Loss Statement</h2>
      <p className="text-soft">
        {vendor.business_name}
        {vendor.owner_name && ` · Owner: ${vendor.owner_name}`}
      </p>
      <p className="text-soft">Period: {periodLabel(period)}</p>
      {/* a new vendor's books can start after the period does */}
      {firstEntry > period.start && <p className="text-soft">Records available from {longDate(firstEntry)}</p>}

      <Lines heading="Income" lines={income} total={totals.sales_cents} totalLabel="Total income" />
      <Lines heading="Expenses" lines={expenses} total={totals.expenses_cents} totalLabel="Total expenses" />

      <div className="mt-4 flex items-end justify-between gap-3 font-serif font-semibold text-2xl">
        <span>Net profit</span>
        <span className="double-underline">{money(totals.profit_cents)}</span>
      </div>

      <p className="mt-5 pt-3 text-sm text-soft border-t border-dashed border-soft/50">
        Generated {longDate(statement.generated)}. Self-prepared record, organized the way lenders and agencies ask
        for. Entries were logged daily with timestamps. Appendix: all entries.
      </p>
    </article>
  );
}

function Appendix({ statement }) {
  return (
    <article className="sheet appendix">
      <h2 className="font-serif font-semibold text-xl">Appendix: all entries</h2>
      <p className="text-soft">
        {statement.vendor.business_name} · {periodLabel(statement.period)} · {statement.entries.length} entries ·
        New York time
      </p>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide border-b-2 border-ink">
            <th className="py-1 pr-2 font-bold">Date</th>
            <th className="py-1 pr-2 font-bold">Time</th>
            <th className="py-1 pr-2 font-bold">Entry</th>
            <th className="py-1 font-bold text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {statement.entries.map((entry) => {
            const sale = entry.type === 'sale';
            return (
              <tr key={entry.id} className="align-top border-b border-line">
                <td className="py-1.5 pr-2 whitespace-nowrap">{shortDate(entry.date)}</td>
                <td className="py-1.5 pr-2 font-mono text-xs leading-5">{entryTime(entry.logged_at)}</td>
                <td className="py-1.5 pr-2">
                  {capitalize(entry.item)}
                  {entry.quantity ? ` ×${entry.quantity}` : ''}
                  <span className="block text-xs text-soft">{sale ? 'Sale' : categoryLabel(entry.category)}</span>
                </td>
                <td className={`py-1.5 text-right whitespace-nowrap ${sale ? 'text-sale' : 'text-expense'}`}>
                  {sale ? '+' : '−'}
                  {money(entry.amount_cents)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </article>
  );
}

export function Statement({ token, onBack }) {
  const [period, setPeriod] = useState('1m');
  // one of: undefined while loading, 'error', or the statement for `period`
  const [statement, setStatement] = useState();

  useEffect(() => {
    let current = true;
    setStatement(undefined);
    fetchStatement(token, period).then(
      (next) => current && setStatement(next),
      () => current && setStatement('error'),
    );
    return () => {
      current = false;
    };
  }, [token, period]);

  const ready = statement && statement !== 'error';

  return (
    <>
      <header className="no-print flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a mi libreta"
          className="w-12 h-12 shrink-0 flex items-center justify-center bg-card border-2 border-line rounded-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-serif font-semibold text-3xl">Estado de cuenta</h1>
      </header>

      <section className="no-print space-y-3">
        <h2 className="font-serif font-semibold text-3xl">¿Para qué lo necesitas?</h2>
        {PURPOSES.map(({ period: key, title, range, Icon }) => {
          const selected = key === period;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => setPeriod(key)}
              className={`w-full flex items-center gap-4 text-left rounded-2xl border-2 px-5 py-4 ${
                selected ? 'bg-mustard-light border-mustard' : 'bg-card border-line'
              }`}
            >
              <Icon className="w-7 h-7 shrink-0" />
              <span className="flex-1">
                <span className="block text-xl font-bold">{title}</span>
                <span className="block text-soft">{range}</span>
              </span>
              {selected && <Check className="w-6 h-6 shrink-0" />}
            </button>
          );
        })}
        <p className="text-soft">Organizado como lo piden los prestamistas y las agencias.</p>
      </section>

      <h2 className="no-print text-sm font-bold uppercase tracking-widest text-soft">Vista previa</h2>

      {statement === undefined && <p className="no-print text-lg text-soft">Preparando tu estado de cuenta…</p>}
      {statement === 'error' && <p className="no-print text-lg">No pudimos crear tu estado de cuenta. Intenta otra vez.</p>}
      {ready && (
        <>
          {statement.entries.length === 0 && (
            <p className="no-print bg-mustard-light border-2 border-mustard rounded-xl px-4 py-3 text-lg">
              Los estados de cuenta cubren meses completos. Lo que anotes este mes aparecerá a partir del 1 de{' '}
              {nextMonthName(statement.generated)}.
            </p>
          )}
          <Summary statement={statement} />
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print w-full rounded-2xl bg-mustard py-5 text-xl font-bold flex items-center justify-center gap-3 shadow-[0_4px_0_0_theme(colors.mustard.dark)]"
          >
            <Download className="w-6 h-6" />
            Guardar PDF
          </button>
          <Appendix statement={statement} />
        </>
      )}
    </>
  );
}
