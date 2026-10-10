import { useEffect, useState } from 'react';

const FRAMES = ['smile', 'talk', 'happy'];

// state: idle | listening | talking | celebrating
export function Moni({ state, className = '' }) {
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    if (state !== 'talking') {
      setMouthOpen(false);
      return;
    }
    const id = setInterval(() => setMouthOpen((open) => !open), 150);
    return () => clearInterval(id);
  }, [state]);

  const frame = state === 'celebrating' ? 'happy' : mouthOpen ? 'talk' : 'smile';

  return (
    <div className={`moni moni-${state} ${className}`}>
      <div className="moni-body">
        {/* all three stay mounted so swapping frames never flickers */}
        {FRAMES.map((name) => (
          <img
            key={name}
            src={`/moni/moni-${name}.png`}
            alt={name === 'smile' ? 'Moni' : ''}
            className={name === frame ? 'on' : ''}
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
}
