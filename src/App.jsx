import { useEffect, useState } from 'react';
import { ConversationProvider } from '@elevenlabs/react';
import { StartScreen } from '@/components/StartScreen';
import { Viewer } from '@/components/Viewer';
import { fetchLedger, vendorToken } from '@/lib/ledger';

const token = vendorToken();

export default function App() {
  // undefined while loading, null when the token matches no vendor
  const [ledger, setLedger] = useState(token ? undefined : null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchLedger(token).then(setLedger, () => setFailed(true));
  }, []);

  if (failed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center text-xl">
        <p>No pudimos abrir tu libreta.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-2xl bg-ink text-paper px-8 py-4 font-bold"
        >
          Intentar otra vez
        </button>
      </main>
    );
  }
  if (ledger === undefined) {
    return <main className="min-h-screen flex items-center justify-center text-xl text-soft">Abriendo tu libreta…</main>;
  }
  if (ledger === null) return <StartScreen notFound={Boolean(token)} />;

  return (
    <ConversationProvider>
      <Viewer token={token} initial={ledger} />
    </ConversationProvider>
  );
}
