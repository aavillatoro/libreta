import { useCallback, useEffect, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Lock } from 'lucide-react';
import { HeroCard } from '@/components/HeroCard';
import { EarlierLedger, TodayLedger } from '@/components/Ledger';
import { Moni } from '@/components/Moni';
import { TalkButton } from '@/components/TalkButton';
import { AGENT_ID, fetchLedger } from '@/lib/ledger';

const CELEBRATE_MS = 1200;
const STAMP_MS = 4000;

export function Viewer({ token, initial }) {
  const [ledger, setLedger] = useState(initial);
  const [freshIds, setFreshIds] = useState(() => new Set());
  const [celebrating, setCelebrating] = useState(false);
  const [bubble, setBubble] = useState(null);
  const knownIds = useRef(new Set(initial.entries.map((e) => e.id)));
  const latestRequest = useRef(0);

  const refetch = useCallback(async () => {
    const request = ++latestRequest.current;
    const next = await fetchLedger(token).catch(() => null);
    // a slower, older response must not overwrite a newer one
    if (!next || request !== latestRequest.current) return;

    const added = next.entries.filter((e) => !knownIds.current.has(e.id)).map((e) => e.id);
    knownIds.current = new Set(next.entries.map((e) => e.id));
    setLedger(next);
    if (added.length === 0) return;

    setFreshIds((ids) => new Set([...ids, ...added]));
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), CELEBRATE_MS);
    setTimeout(() => {
      setFreshIds((ids) => new Set([...ids].filter((id) => !added.includes(id))));
    }, STAMP_MS);
  }, [token]);

  const { startSession, endSession, status, isSpeaking } = useConversation({
    onMessage: ({ message, source, role }) => {
      if (source !== 'ai' && role !== 'agent') return;
      setBubble(message);
      refetch();
    },
    // the entry is saved here, a moment before moni says so
    onAgentToolResponse: () => refetch(),
    onError: () => setBubble('No pude conectarme. Intenta otra vez.'),
  });

  const start = async () => {
    try {
      // ask for the mic up front so a denial gets a message in spanish
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setBubble('Necesito tu micrófono para escucharte. Actívalo y toca el botón otra vez.');
      return;
    }
    startSession({
      agentId: AGENT_ID,
      connectionType: 'webrtc',
      dynamicVariables: { user_token: token },
    });
  };

  const connected = status === 'connected';
  const moniState = celebrating ? 'celebrating' : connected && isSpeaking ? 'talking' : connected ? 'listening' : 'idle';
  const name = ledger.vendor.owner_name;

  return (
    <main className="min-h-screen max-w-md mx-auto px-5 pt-7 pb-8 space-y-7">
      <header>
        <h1 className="font-serif font-semibold text-4xl">Libreta</h1>
        <p className="text-soft">{ledger.vendor.business_name}</p>
      </header>

      <div className="flex items-center gap-2">
        <Moni state={moniState} className="-ml-3" />
        <p aria-live="polite" className="flex-1 bg-card border-2 border-line rounded-2xl rounded-bl-sm px-4 py-3 text-lg leading-snug">
          {bubble ?? `Hola${name ? `, ${name}` : ''}. Toca el botón y cuéntame qué vendiste o qué compraste.`}
        </p>
      </div>

      <HeroCard today={ledger.today} totals={ledger.totals.today} />
      <TodayLedger today={ledger.today} entries={ledger.entries} freshIds={freshIds} />

      <div className="space-y-4">
        <button
          type="button"
          className="w-full rounded-2xl bg-mustard py-5 text-xl font-bold shadow-[0_4px_0_0_theme(colors.mustard.dark)]"
        >
          Crear mi estado de cuenta
        </button>
        <TalkButton status={status} onStart={start} onEnd={endSession} />
      </div>

      <EarlierLedger today={ledger.today} entries={ledger.entries} freshIds={freshIds} />

      <footer className="pt-4 flex items-center justify-center gap-2 text-soft">
        <Lock className="w-4 h-4 shrink-0" />
        Tus datos son tuyos. Solo tú decides quién los ve.
      </footer>
    </main>
  );
}
