import { useCallback, useEffect, useState } from 'react';

const KEY = 'mentor-connect.theme';
const systemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// Theme = the user's explicit choice (saved in localStorage) or, until they choose, the system setting.
// The choice is applied as <html data-theme="..."> which the CSS tokens in index.css react to.
export const useTheme = () => {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || systemTheme());

  // While there is no explicit choice, follow live changes of the OS setting.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (!document.documentElement.dataset.theme) setTheme(systemTheme()); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch { /* storage blocked: the choice just lasts for this visit */ }
    setTheme(next);
  }, [theme]);

  return { theme, toggle };
};
