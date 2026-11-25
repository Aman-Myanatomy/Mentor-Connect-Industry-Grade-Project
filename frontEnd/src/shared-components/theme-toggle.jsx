import { useTheme } from '../hooks/use-theme';
import { Icon } from './icon';

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button className="btn btn-ghost btn-icon theme-toggle" onClick={toggle} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
};
