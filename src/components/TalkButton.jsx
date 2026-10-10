import { Mic, Square } from 'lucide-react';

export function TalkButton({ status, onStart, onEnd }) {
  const connected = status === 'connected';
  const connecting = status === 'connecting';
  return (
    <button
      type="button"
      onClick={connected ? onEnd : onStart}
      disabled={connecting}
      className="w-full rounded-2xl bg-ink text-paper py-5 text-xl font-bold flex items-center justify-center gap-3 disabled:opacity-70"
    >
      {connected ? <Square className="w-5 h-5 text-mustard fill-mustard" /> : <Mic className="w-6 h-6 text-mustard" />}
      {connected ? 'Terminar' : connecting ? 'Conectando…' : 'Hablar con Moni'}
    </button>
  );
}
