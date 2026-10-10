import { useState } from 'react';
import { Moni } from '@/components/Moni';
import { DEMO_TOKEN, createVendor, markNewVendor, vendorLink } from '@/lib/ledger';

const inputClass = 'mt-1 w-full rounded-xl border-2 border-line bg-card px-4 py-3 text-xl';

function NewVendorForm() {
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [status, setStatus] = useState('idle');

  const submit = async (event) => {
    event.preventDefault();
    setStatus('saving');
    try {
      const token = await createVendor(businessName, ownerName);
      markNewVendor(token);
      window.location.assign(vendorLink(token));
    } catch {
      setStatus('failed');
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 w-full space-y-4 text-left">
      <label className="block text-lg font-bold">
        Nombre de tu negocio
        <input
          className={inputClass}
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          maxLength={60}
          required
          autoFocus
        />
      </label>
      <label className="block text-lg font-bold">
        Tu nombre o apodo
        <input
          className={inputClass}
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          maxLength={60}
          required
        />
      </label>
      {status === 'failed' && <p className="text-lg">No pudimos crear tu libreta. Intenta otra vez.</p>}
      <button
        type="submit"
        disabled={status === 'saving' || !businessName.trim() || !ownerName.trim()}
        className="w-full rounded-2xl bg-ink text-paper py-5 text-2xl font-bold disabled:opacity-60"
      >
        {status === 'saving' ? 'Creando…' : 'Crear mi libreta'}
      </button>
    </form>
  );
}

export function StartScreen({ notFound }) {
  const [starting, setStarting] = useState(false);
  return (
    // smaller on short phones so base44's corner badge doesn't sit on the buttons
    <main className="min-h-screen max-w-md mx-auto px-6 pt-12 [@media(max-height:640px)]:pt-4 pb-24 flex flex-col items-center justify-center text-center">
      <Moni state="idle" className="!w-44 !h-44 [@media(max-height:640px)]:!w-24 [@media(max-height:640px)]:!h-24" />
      <h1 className="mt-2 font-serif font-semibold text-5xl">Libreta</h1>
      <p className="mt-3 text-xl text-soft">Cuéntale a Moni lo que vendiste y lo que gastaste. Ella lo anota.</p>
      {notFound && (
        <p className="mt-6 w-full bg-mustard-light border-2 border-mustard rounded-xl px-4 py-3 text-lg">
          No encontramos esa libreta. Revisa tu enlace.
        </p>
      )}
      {starting ? (
        <NewVendorForm />
      ) : (
        <button
          type="button"
          onClick={() => setStarting(true)}
          className="mt-8 w-full rounded-2xl bg-ink text-paper py-5 text-2xl font-bold"
        >
          Empezar mi libreta
        </button>
      )}
      <a
        href={vendorLink(DEMO_TOKEN)}
        className="mt-4 w-full rounded-2xl bg-mustard py-5 text-2xl font-bold shadow-[0_4px_0_0_theme(colors.mustard.dark)] active:translate-y-0.5 active:shadow-none"
      >
        Ver demo
      </a>
      <p className="mt-3 text-soft">Negocio de muestra con datos de ejemplo.</p>
    </main>
  );
}
