export const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?';

export const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const formatDay = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 864e5);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
};

// "now", "5m", "3h", "Yesterday", "Mon 24 Nov": compact timestamps for the conversation list.
export const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000 && new Date(iso).toDateString() === new Date().toDateString()) return `${Math.floor(diff / 3_600_000)}h`;
  return formatDay(iso);
};
