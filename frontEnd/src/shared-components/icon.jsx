// Tiny inline icon set (stroke icons, 24px grid). No icon library => nothing extra to install or explain.
const PATHS = {
  sparkles:
    'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z',
  send: 'M5 12l14-7-5 14-2.5-5.5L5 12z',
  logout: 'M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 16l-4-4 4-4M6 12h10',
  users:
    'M16 19v-1.5a3.5 3.5 0 00-3.5-3.5h-4A3.5 3.5 0 005 17.5V19M10.5 11a3 3 0 100-6 3 3 0 000 6zM19 19v-1.5a3.5 3.5 0 00-2.5-3.35M15.5 5.2a3 3 0 010 5.6',
  chat: 'M20 12a8 8 0 01-11.6 7.1L4 20l1-3.9A8 8 0 1120 12z',
  shield: 'M12 3l7 3v5.5c0 4.2-2.9 7.6-7 9.5-4.1-1.9-7-5.3-7-9.5V6l7-3zM9 12l2 2 4-4',
  wand: 'M5 19L15 9M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2zM19 12l.7 1.3L21 14l-1.3.7L19 16l-.7-1.3L17 14l1.3-.7L19 12z',
  alert: 'M12 8v5M12 16.5v.01M10.3 4.2L2.8 17.5A2 2 0 004.5 20.5h15a2 2 0 001.7-3L13.7 4.2a2 2 0 00-3.4 0z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  video: 'M16 10.5l5-3v9l-5-3M4.5 6.5h8.5a2 2 0 012 2v7a2 2 0 01-2 2H4.5a2 2 0 01-2-2v-7a2 2 0 012-2z',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3A4 4 0 0010 18.7l1-1',
  close: 'M6 6l12 12M18 6L6 18',
  sun: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1 1M17.4 17.4l1 1M5.6 18.4l1-1M17.4 6.6l1-1',
  moon: 'M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z'
};

export const Icon = ({ name, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={PATHS[name]} />
  </svg>
);
