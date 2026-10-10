import { dateLabel, money } from '@/lib/ledger';

export function HeroCard({ today, totals }) {
  return (
    <section className="bg-card border-2 border-line rounded-2xl px-6 pt-5 pb-6 shadow-[0_4px_0_0_theme(colors.line)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold tracking-widest text-soft">HOY</span>
        <span className="date-stamp">{dateLabel(today)}</span>
      </div>
      <div className="flex justify-between py-3 text-xl border-b border-line">
        <span>Ventas</span>
        <span>{money(totals.sales_cents)}</span>
      </div>
      <div className="flex justify-between py-3 text-xl border-b border-line">
        <span>Gastos</span>
        <span>{money(totals.expenses_cents)}</span>
      </div>
      <div className="flex items-end justify-between gap-3 pt-5 font-serif font-semibold">
        <span className="text-3xl">Ganancia</span>
        <span className="text-5xl double-underline">{money(totals.profit_cents)}</span>
      </div>
    </section>
  );
}
