import { useEffect, useState } from 'react';

// Reveals text word by word, like the model is writing it. (Cosmetic: the full text is already here.)
export const TypedText = ({ text, msPerWord = 28 }) => {
  const words = text.split(/(\s+)/);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [shown, setShown] = useState(reduced ? words.length : 0);
  useEffect(() => {
    if (reduced) return;
    setShown(0);
    const id = window.setInterval(
      () =>
        setShown((n) => {
          if (n >= words.length) {
            window.clearInterval(id);
            return n;
          }
          return n + 2;
        }),
      msPerWord
    );
    return () => window.clearInterval(id);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span aria-label={text}>{words.slice(0, shown).join('')}</span>;
};
