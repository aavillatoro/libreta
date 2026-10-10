import { Moni } from '@/components/Moni';
import { DEMO_TOKEN, vendorLink } from '@/lib/ledger';

export function StartScreen({ notFound }) {
  return (
    <main className="min-h-screen max-w-md mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
      <Moni state="idle" className="!w-44 !h-44" />
      <h1 className="mt-2 font-serif font-semibold text-5xl">Libreta</h1>
      <p className="mt-3 text-xl text-soft">Cuéntale a Moni lo que vendiste y lo que gastaste. Ella lo anota.</p>
      {notFound && (
        <p className="mt-6 w-full bg-mustard-light border-2 border-mustard rounded-xl px-4 py-3 text-lg">
          No encontramos esa libreta. Revisa tu enlace.
        </p>
      )}
      <a
        href={vendorLink(DEMO_TOKEN)}
        className="mt-8 w-full rounded-2xl bg-mustard py-5 text-2xl font-bold shadow-[0_4px_0_0_theme(colors.mustard.dark)] active:translate-y-0.5 active:shadow-none"
      >
        Ver demo
      </a>
      <p className="mt-3 text-soft">Negocio de muestra con datos de ejemplo.</p>
    </main>
  );
}
