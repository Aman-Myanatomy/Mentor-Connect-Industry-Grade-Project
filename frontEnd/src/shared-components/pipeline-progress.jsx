import { useEffect, useState } from 'react';
import { Icon } from './icon';

const STEPS = ['Checking your message', 'Understanding your goal', 'Searching mentors', 'Ranking the best fits', 'Verifying the results'];

// A live-feeling progress list while the AI pipeline runs. Timing is illustrative; the real per-step timings
// arrive with the response and are shown in "How the AI decided".
export const PipelineProgress = () => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setActive((n) => Math.min(n + 1, STEPS.length - 1)), 900);
    return () => window.clearInterval(id);
  }, []);
  return (
    <ul className="progress" aria-live="polite" aria-busy="true">
      {STEPS.map((s, i) => (
        <li key={s} className={i < active ? 'done' : i === active ? 'active' : ''} style={{ '--i': i }}>
          <span className="progress-dot">{i < active ? <Icon name="check" size={13} /> : <i />}</span>
          {s}
        </li>
      ))}
    </ul>
  );
};
